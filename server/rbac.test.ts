import { describe, expect, it } from "vitest";
import { canAccessRole } from "./rbac";

describe("RBAC da Igreja Jornada", () => {
  it("permite que membros acedam apenas às experiências destinadas ao membro", () => {
    expect(canAccessRole("member", "view_member_area")).toBe(true);
    expect(canAccessRole("member", "manage_gallery")).toBe(false);
    expect(canAccessRole("member", "manage_prayers")).toBe(false);
    expect(canAccessRole("member", "view_pastoral")).toBe(false);
  });

  it("reserva a atenção pastoral ao perfil de Pastor", () => {
    expect(canAccessRole("pastor", "view_pastoral")).toBe(true);
    expect(canAccessRole("administrator", "view_pastoral")).toBe(false);
    expect(canAccessRole("member", "view_pastoral")).toBe(false);
  });

  it("mantém a operação do sistema no papel de Administrador", () => {
    expect(canAccessRole("administrator", "manage_gallery")).toBe(true);
    expect(canAccessRole("pastor", "manage_members")).toBe(false);
    expect(canAccessRole("pastor", "manage_content")).toBe(false);
  });

  it("concede ao Administrador acesso às operações transversais", () => {
    expect(canAccessRole("administrator", "manage_church")).toBe(true);
    expect(canAccessRole("administrator", "manage_ebd")).toBe(true);
    expect(canAccessRole("administrator", "manage_connections")).toBe(true);
  });
});
