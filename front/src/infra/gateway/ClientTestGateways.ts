import { InMemoryEstablishmentGateway } from "src/core-logic/adapters/InMemoryEstablishmentGateway";
import { InMemoryImmersionApplicationGateway } from "src/core-logic/adapters/InMemoryImmersionApplicationGateway";
import { ClientGateways } from "src/core-logic/ports/ClientGateways";
import { InMemoryEstablishmentUiGateway } from "src/infra/gateway/EstablishmentUiGateway.ts/InMemoryEstablishmentUiGaetway";
import { InMemoryEventGateway } from "./EventGateway/InMemoryEventGateway";

export interface ClientTestGateways extends ClientGateways {
  immersionApplication: InMemoryImmersionApplicationGateway;
  establishmentsUi: InMemoryEstablishmentUiGateway;
  event: InMemoryEventGateway;
  establishments: InMemoryEstablishmentGateway;
}