import React, { useState } from "react";
import { conventionGateway } from "src/app/config/dependencies";
import { routes } from "src/app/routing/routes";
import { decodeJwt } from "src/core-logic/adapters/decodeJwt";
import { ConventionStatus } from "shared/src/convention/convention.dto";
import { statusTransitionConfigs } from "shared/src/convention/conventionStatusTransitions";
import {
  ConventionMagicLinkPayload,
  Role,
} from "shared/src/tokens/MagicLinkPayload";
import { ConventionFormAccordion } from "src/uiComponents/admin/ConventionFormAccordion";
import { Route } from "type-route";
import { ApiDataContainer } from "../admin/ApiDataContainer";
import { VerificationActionButton } from "./VerificationActionButton";
import { Notification } from "react-design-system/immersionFacile";

type VerificationPageProps = {
  route: Route<typeof routes.conventionToValidate>;
};

const isAllowedTransition = (
  initialStatus: ConventionStatus,
  targetStatus: ConventionStatus,
  actingRole: Role,
) => {
  const transitionConfig = statusTransitionConfigs[targetStatus];

  return (
    transitionConfig.validInitialStatuses.includes(initialStatus) &&
    transitionConfig.validRoles.includes(actingRole)
  );
};

export const ConventionValidatePage = ({ route }: VerificationPageProps) => {
  const jwt = route.params.jwt;
  const { role } = decodeJwt<ConventionMagicLinkPayload>(jwt);

  const [successMessage, setSuccessMessage] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const disabled = !!successMessage;

  return (
    <ApiDataContainer
      callApi={() => conventionGateway.getMagicLink(jwt)}
      jwt={jwt}
    >
      {(convention) => {
        if (!convention) {
          return <p>"Chargement en cours"</p>;
        }

        const currentStatus = convention.status;

        const buttonProps = {
          disabled,
          convention,
          jwt,
          onSuccess: setSuccessMessage,
          onError: setErrorMessage,
        };
        const { status } = convention;

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <ConventionFormAccordion convention={convention} />
            <div>
              {isAllowedTransition(status, "REJECTED", role) && (
                <VerificationActionButton
                  {...buttonProps}
                  newStatus="REJECTED"
                  messageToShowOnSuccess="Succ??s. La d??cision de refuser cette immersion est bien enregistr??e. Cette d??cision va ??tre communiqu??e par mail au b??n??ficiaire et ?? l'entreprise."
                >
                  Refuser l'immersion ...
                </VerificationActionButton>
              )}

              {isAllowedTransition(status, "DRAFT", role) && (
                <VerificationActionButton
                  {...buttonProps}
                  newStatus="DRAFT"
                  messageToShowOnSuccess={
                    "Succ??s. Cette demande de modification va ??tre communiqu??e par mail au b??n??ficiaire et ?? l'entreprise"
                  }
                >
                  Renvoyer au b??n??ficiaire pour modification
                </VerificationActionButton>
              )}
              {isAllowedTransition(status, "ACCEPTED_BY_COUNSELLOR", role) && (
                <VerificationActionButton
                  {...buttonProps}
                  newStatus="ACCEPTED_BY_COUNSELLOR"
                  messageToShowOnSuccess={
                    "Succ??s. L'??ligibilit?? de cette demande est bien enregistr??e. Une notification est envoy??e au responsable des validations pour qu'elle/il confirme ou non la validation de cette demande et initie la Convention."
                  }
                  disabled={!!successMessage || currentStatus != "IN_REVIEW"}
                >
                  {currentStatus === "ACCEPTED_BY_COUNSELLOR"
                    ? "Demande d??j?? valid??e."
                    : "Marquer la demande comme ??ligible"}
                </VerificationActionButton>
              )}
              {isAllowedTransition(status, "ACCEPTED_BY_VALIDATOR", role) && (
                <VerificationActionButton
                  {...buttonProps}
                  newStatus="ACCEPTED_BY_VALIDATOR"
                  messageToShowOnSuccess={
                    "Succ??s. La validation de cette demande est bien enregistr??e. La confirmation de cette validation va ??tre communiqu??e par mail au b??n??ficiaire et ?? l'entreprise."
                  }
                  disabled={
                    !!successMessage ||
                    (currentStatus != "IN_REVIEW" &&
                      currentStatus != "ACCEPTED_BY_COUNSELLOR")
                  }
                >
                  {currentStatus === "ACCEPTED_BY_VALIDATOR"
                    ? "Demande d??j?? valid??e"
                    : "Valider la demande"}
                </VerificationActionButton>
              )}
              {errorMessage && (
                <Notification
                  type="error"
                  title="Veuillez nous excuser. Un probl??me est survenu qui a compromis l'enregistrement de vos informations. Veuillez r??essayer ult??rieurement"
                >
                  {errorMessage}
                </Notification>
              )}

              {successMessage && (
                <Notification type="success" title="Succ??s">
                  {successMessage}
                </Notification>
              )}
            </div>
          </div>
        );
      }}
    </ApiDataContainer>
  );
};
