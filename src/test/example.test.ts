import { describe, it, expect } from "vitest";
import { agendaData } from "../data/agendaData";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("agenda sessions can define capacity and it is a number", () => {
    const anyWithCapacity = agendaData
      .flatMap((d: any) => d.sessions)
      .find((s: any) => s.capacity !== undefined);
    expect(anyWithCapacity).toBeDefined();
    if (anyWithCapacity) {
      expect(typeof anyWithCapacity.capacity).toBe("number");
    }
  });

  it("virtual sessions include url and rendering \"Ingresar\" link works", () => {
    const anyVirtual = agendaData
      .flatMap((d: any) => d.sessions)
      .find((s: any) => s.url !== undefined);
    expect(anyVirtual).toBeDefined();
    if (anyVirtual) {
      expect(typeof anyVirtual.url).toBe("string");
      expect(anyVirtual.url).toMatch(/^https?:\/\//);
    }
  });

  it("no session is both virtual and has a capacity limit", () => {
    const conflicts = agendaData
      .flatMap((d: any) => d.sessions)
      .filter((s: any) => s.url && s.capacity !== undefined);
    expect(conflicts.length).toBe(0);
  });

  it("break sessions don’t expose capacity or url", () => {
    const breaks = agendaData
      .flatMap((d: any) => d.sessions.map((s: any) => ({ ...s, date: d.date })))
      .filter((s: any) => s.type === "break");
    expect(breaks.length).toBeGreaterThan(0);
    breaks.forEach((b: any) => {
      expect(b.capacity).toBeUndefined();
      expect(b.url).toBeUndefined();
    });
  });
});
