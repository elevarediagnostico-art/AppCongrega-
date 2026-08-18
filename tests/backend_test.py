"""Backend tests for CONGREGA / Igreja Jornada (tRPC + superjson).

Covers:
- Health check
- Auth (auth.me) with/without Bearer token
- Tenancy/RBAC (church.mine)
- Member journey (member.home, bible.complete)
- Member content endpoints
- RBAC enforcement (care.*, admin.*, reports.*, management.*)
"""
import json
import os
from urllib.parse import quote

import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://e11c7d8a-e146-47bb-b6ac-5035213ec69b.preview.emergentagent.com",
).rstrip("/")

TOKENS = {
    "administrator": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJhZG1pbi1kZW1vIiwiYXBwSWQiOiJjb25ncmVnYSIsIm5hbWUiOiJBbmEgQWRtaW5pc3RyYWRvcmEiLCJleHAiOjE4MTg2MDY2ODZ9.eyRkabydCbxhE4Idd8VYg9hItYoYe2DOfiWryGca2Wg",
    "pastor": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJwYXN0b3ItZGVtbyIsImFwcElkIjoiY29uZ3JlZ2EiLCJuYW1lIjoiUGF1bG8gUGFzdG9yIiwiZXhwIjoxODE4NjA2Njg2fQ.c0PTqaKoo_qNwHRdd7vhSeEbA_wnM5x2UwIMrIKL3js",
    "member": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuSWQiOiJtZW1iZXItZGVtbyIsImFwcElkIjoiY29uZ3JlZ2EiLCJuYW1lIjoiTWFyY29zIE1lbWJybyIsImV4cCI6MTgxODYwNjY4Nn0.3hAXL73xYr3DunrkwBD18gwJqBYnVm2iSEskEUcuh7k",
}


def _headers(role=None):
    h = {"Content-Type": "application/json"}
    if role:
        h["Authorization"] = f"Bearer {TOKENS[role]}"
    return h


def trpc_query(procedure, role=None, input_obj=None):
    url = f"{BASE_URL}/api/trpc/{procedure}"
    if input_obj is not None:
        payload = {"json": input_obj}
        url += f"?input={quote(json.dumps(payload))}"
    return requests.get(url, headers=_headers(role), timeout=30)


def trpc_mutate(procedure, role=None, input_obj=None, date_fields=None):
    url = f"{BASE_URL}/api/trpc/{procedure}"
    body = {"json": input_obj if input_obj is not None else {}}
    if date_fields:
        body["meta"] = {"values": {f: ["Date"] for f in date_fields}}
    return requests.post(url, headers=_headers(role), json=body, timeout=30)


def data_json(resp):
    return resp.json()["result"]["data"]["json"]


def error_code(resp):
    j = resp.json()
    try:
        return j["error"]["json"]["data"]["code"]
    except Exception:
        pass
    try:
        return j["error"]["data"]["code"]
    except Exception:
        return None


# ---------- Health ----------
def test_health():
    r = requests.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# ---------- Auth ----------
def test_auth_me_no_token_returns_null():
    r = trpc_query("auth.me")
    assert r.status_code == 200, r.text
    assert data_json(r) is None


@pytest.mark.parametrize("role,expected_open_id", [
    ("administrator", "admin-demo"),
    ("pastor", "pastor-demo"),
    ("member", "member-demo"),
])
def test_auth_me_with_token(role, expected_open_id):
    r = trpc_query("auth.me", role=role)
    assert r.status_code == 200, r.text
    d = data_json(r)
    assert d is not None
    assert d["openId"] == expected_open_id


def test_protected_procedure_without_token_unauthorized():
    r = trpc_query("church.mine")
    assert r.status_code in (401, 400), r.text
    assert error_code(r) == "UNAUTHORIZED"


# ---------- Tenancy / RBAC via church.mine ----------
@pytest.mark.parametrize("role,expected_role", [
    ("administrator", "administrator"),
    ("pastor", "pastor"),
    ("member", "member"),
])
def test_church_mine(role, expected_role):
    r = trpc_query("church.mine", role=role)
    assert r.status_code == 200, r.text
    d = data_json(r)
    # Response is likely {church:{...}, role:...} or a list; be flexible.
    text = json.dumps(d)
    assert "Comunidade CONGREGA" in text
    assert expected_role in text


# ---------- Member journey ----------
def test_member_home_returns_expected_shape():
    r = trpc_query("member.home", role="member", input_obj={"churchId": 1})
    assert r.status_code == 200, r.text
    d = data_json(r)
    text = json.dumps(d).lower()
    # Check key sections
    assert "devotional" in text or "devocional" in text
    assert "gênesis" in text or "genesis" in text or "biblePlan" in json.dumps(d) or "plan" in text
    # progress/streak
    assert "progress" in text or "streak" in text


def test_bible_complete_and_progress_increases():
    # Fetch member.home to discover a readingId to complete
    r1 = trpc_query("member.home", role="member", input_obj={"churchId": 1})
    assert r1.status_code == 200
    d = data_json(r1)
    # Look for reading id from bible plan section
    reading_id = None
    text = json.dumps(d)
    # try common shapes
    def find_reading_id(obj):
        if isinstance(obj, dict):
            if "readingId" in obj and isinstance(obj["readingId"], int):
                return obj["readingId"]
            # sometimes {id: X} inside "reading" or "today"
            for k in ("reading", "todayReading", "today", "current"):
                if k in obj:
                    v = obj[k]
                    if isinstance(v, dict) and "id" in v and isinstance(v["id"], int):
                        return v["id"]
            for v in obj.values():
                r = find_reading_id(v)
                if r:
                    return r
        elif isinstance(obj, list):
            for v in obj:
                r = find_reading_id(v)
                if r:
                    return r
        return None
    reading_id = find_reading_id(d) or 1
    # Ensure member is enrolled in the official plan (plan id 1 in seed)
    # First discover planId from member.home
    def find_plan_id(obj):
        if isinstance(obj, dict):
            if "planId" in obj and isinstance(obj["planId"], int):
                return obj["planId"]
            for k in ("plan", "biblePlan"):
                if k in obj and isinstance(obj[k], dict) and "id" in obj[k]:
                    return obj[k]["id"]
            for v in obj.values():
                r = find_plan_id(v)
                if r:
                    return r
        elif isinstance(obj, list):
            for v in obj:
                r = find_plan_id(v)
                if r:
                    return r
        return None
    plan_id = find_plan_id(d) or 1
    enroll_resp = trpc_mutate("bible.enroll", role="member",
                              input_obj={"churchId": 1, "planId": plan_id, "mode": "official"})
    assert enroll_resp.status_code == 200, f"bible.enroll failed: {enroll_resp.status_code} {enroll_resp.text[:400]}"

    r_plan = trpc_mutate("bible.complete", role="member",
                         input_obj={"churchId": 1, "readingId": reading_id})
    assert r_plan.status_code == 200, f"bible.complete failed: {r_plan.status_code} {r_plan.text[:400]}"
    assert data_json(r_plan).get("success") is True

    # Subsequent home call still works
    r2 = trpc_query("member.home", role="member", input_obj={"churchId": 1})
    assert r2.status_code == 200


# ---------- Member content endpoints ----------
@pytest.mark.parametrize("proc", [
    "member.dailyDevotional",
    "community.calendar",
    "community.events",
    "community.announcements",
    "connections.list",
    "ebd.classes",
])
def test_member_content_endpoints_200(proc):
    r = trpc_query(proc, role="member", input_obj={"churchId": 1})
    assert r.status_code == 200, f"{proc} -> {r.status_code}: {r.text[:400]}"


# ---------- RBAC enforcement ----------
def test_care_pastoral_signals_pastor_ok_member_forbidden():
    r_ok = trpc_query("care.pastoralSignals", role="pastor",
                      input_obj={"churchId": 1})
    assert r_ok.status_code == 200, r_ok.text

    r_forbidden = trpc_query("care.pastoralSignals", role="member",
                             input_obj={"churchId": 1})
    assert r_forbidden.status_code in (401, 403), r_forbidden.text
    assert error_code(r_forbidden) == "FORBIDDEN"


def test_care_recalculate_pastor_ok_member_forbidden():
    r_ok = trpc_mutate("care.recalculatePastoralSignals", role="pastor",
                      input_obj={"churchId": 1})
    assert r_ok.status_code == 200, r_ok.text
    r_forbidden = trpc_mutate("care.recalculatePastoralSignals", role="member",
                              input_obj={"churchId": 1})
    assert r_forbidden.status_code in (401, 403)
    assert error_code(r_forbidden) == "FORBIDDEN"


@pytest.mark.parametrize("role", ["administrator", "pastor"])
def test_admin_dashboard_admin_pastor_ok(role):
    r = trpc_query("admin.dashboard", role=role, input_obj={"churchId": 1})
    assert r.status_code == 200, r.text


def test_admin_dashboard_member_forbidden():
    r = trpc_query("admin.dashboard", role="member", input_obj={"churchId": 1})
    assert r.status_code in (401, 403)
    assert error_code(r) == "FORBIDDEN"


@pytest.mark.parametrize("role", ["administrator", "pastor"])
def test_reports_monthly_admin_pastor_ok(role):
    r = trpc_query("reports.monthly", role=role,
                   input_obj={"churchId": 1, "month": "2026-01"})
    assert r.status_code == 200, r.text


def test_reports_monthly_member_forbidden():
    r = trpc_query("reports.monthly", role="member",
                   input_obj={"churchId": 1, "month": "2026-01"})
    assert r.status_code in (401, 403)
    assert error_code(r) == "FORBIDDEN"


def test_management_create_announcement_admin_ok_member_forbidden():
    payload = {
        "churchId": 1,
        "title": "TEST_Aviso",
        "content": "Aviso de teste automatizado",
    }
    r_ok = trpc_mutate("management.createAnnouncement", role="administrator",
                       input_obj=payload)
    assert r_ok.status_code == 200, f"admin create announcement failed: {r_ok.status_code} {r_ok.text[:500]}"

    r_forbidden = trpc_mutate("management.createAnnouncement", role="member",
                              input_obj=payload)
    assert r_forbidden.status_code in (401, 403), r_forbidden.text
    assert error_code(r_forbidden) == "FORBIDDEN"


def test_management_create_event_admin_ok_member_forbidden():
    payload = {
        "churchId": 1,
        "title": "TEST_Evento",
        "startsAt": "2026-12-01T19:00:00.000Z",
        "endsAt": "2026-12-01T21:00:00.000Z",
        "location": "Templo",
    }
    r_ok = trpc_mutate("management.createEvent", role="administrator",
                       input_obj=payload, date_fields=["startsAt", "endsAt"])
    assert r_ok.status_code == 200, f"admin create event failed: {r_ok.status_code} {r_ok.text[:500]}"
    r_forbidden = trpc_mutate("management.createEvent", role="member",
                              input_obj=payload, date_fields=["startsAt", "endsAt"])
    assert r_forbidden.status_code in (401, 403)
    assert error_code(r_forbidden) == "FORBIDDEN"
