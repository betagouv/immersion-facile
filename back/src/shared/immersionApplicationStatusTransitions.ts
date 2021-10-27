import { ApplicationStatus } from "../shared/ImmersionApplicationDto";
import { Role } from "../shared/tokens/MagicLinkPayload";
import { DomainTopic } from "../domain/core/eventBus/events";

export type StatusTransitionConfig = {
  validInitialStatuses: ApplicationStatus[];
  validRoles: Role[];
  domainTopic: DomainTopic;
};

// key: status transition target, value: status transition config
export const statusTransitionConfigs: Partial<
  Record<ApplicationStatus, StatusTransitionConfig>
> = {
  ACCEPTED_BY_COUNSELLOR: {
    validInitialStatuses: ["IN_REVIEW"],
    validRoles: ["counsellor"],
    domainTopic: "ImmersionApplicationAcceptedByCounsellor",
  },
  ACCEPTED_BY_VALIDATOR: {
    validInitialStatuses: ["IN_REVIEW", "ACCEPTED_BY_COUNSELLOR"],
    validRoles: ["validator"],
    domainTopic: "ImmersionApplicationAcceptedByValidator",
  },
  VALIDATED: {
    validInitialStatuses: ["ACCEPTED_BY_COUNSELLOR", "ACCEPTED_BY_VALIDATOR"],
    validRoles: ["admin"],
    domainTopic: "FinalImmersionApplicationValidationByAdmin",
  },

  // This config allows a counsellor to reject an application after it been
  // accepted by a validator. Should we be stricter? We assume that this is a
  // rare edge case that can be addressed at a later stage.
  REJECTED: {
    validInitialStatuses: [
      "IN_REVIEW",
      "ACCEPTED_BY_VALIDATOR",
      "ACCEPTED_BY_COUNSELLOR",
    ],
    validRoles: ["counsellor", "validator", "admin"],
    domainTopic: "ImmersionApplicationRejected",
  },

  // This enables the "require modifications" flow. The agents can put the request
  // back in the draft state for the beneficiary to modify the request and reapply.
  DRAFT: {
    validInitialStatuses: [
      "IN_REVIEW",
      "ACCEPTED_BY_VALIDATOR",
      "ACCEPTED_BY_COUNSELLOR",
    ],
    validRoles: ["counsellor", "validator", "admin"],
    domainTopic: "ImmersionApplicationRequiresModification",
  },
};
