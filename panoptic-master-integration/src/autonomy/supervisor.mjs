export const AUTONOMY = Object.freeze({
  A0: "OBSERVE_ONLY",
  A1: "RECOMMEND",
  A2: "REVERSIBLE_WITH_APPROVAL",
  A3: "BOUNDED_LOCAL_AUTOMATIC",
  A4: "MULTI_COMPONENT_BOUNDED_AUTOMATIC"
});

const ESCALATION_CLASSES = new Set([
  "irreversible",
  "external-financial-transfer",
  "new-banking-authority",
  "unapproved-grid-dispatch",
  "telecom-regulatory",
  "legal-filing",
  "ownership-control-transfer",
  "unapproved-production-deployment",
  "credential-change",
  "material-policy-change",
  "evidence-conflict"
]);

export class AutonomySupervisor {
  constructor({ level = "A4" } = {}) {
    this.level = level;
    this.paused = false;
    this.killed = false;
    this.incidents = [];
  }

  classify(action = {}) {
    const impact = action.impactClass || "reversible-local";
    const mustEscalate = ESCALATION_CLASSES.has(impact);

    return {
      level: this.level,
      impact,
      mustEscalate,
      permittedAutomatically:
        this.level === "A4" &&
        !this.paused &&
        !this.killed &&
        !mustEscalate &&
        action.preAuthorized === true &&
        action.reversible !== false
    };
  }

  pause(reason = "manual") { this.paused = true; this.incidents.push({ type: "PAUSE", reason, at: new Date().toISOString() }); }
  resume() { if (!this.killed) this.paused = false; }
  kill(reason = "manual") { this.killed = true; this.paused = true; this.incidents.push({ type: "KILL", reason, at: new Date().toISOString() }); }

  decompose(mission, actions = []) {
    return actions.map((action, index) => ({
      step: index + 1,
      missionId: mission.missionId,
      action,
      decision: this.classify(action)
    }));
  }
}