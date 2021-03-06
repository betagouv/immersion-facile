import { EstablishmentJwtPayload } from "shared/src/tokens/MagicLinkPayload";
import { DomainEvent } from "../eventBus/events";

export interface OutboxQueries {
  getLastPayloadOfFormEstablishmentEditLinkSentWithSiret: (
    siret: string,
  ) => Promise<EstablishmentJwtPayload | undefined>;
  getAllUnpublishedEvents: () => Promise<DomainEvent[]>;
  getAllFailedEvents: () => Promise<DomainEvent[]>;
}
