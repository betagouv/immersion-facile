import { Router } from "express";
import promClient from "prom-client";
import {
  formEstablishmentsRoute,
  immersionOffersRoute,
} from "shared/src/routes";
import type { AppDependencies } from "../config/createAppDependencies";
import { sendHttpResponse } from "../helpers/sendHttpResponse";
import {
  ForbiddenError,
  UnauthorizedError,
  validateAndParseZodSchema,
} from "../helpers/httpErrors";
import { pipeWithValue } from "shared/src/pipeWithValue";
import { formEstablishmentSchema } from "shared/src/formEstablishment/FormEstablishment.schema";
import { SiretAndRomeDto } from "shared/src/siretAndRome/SiretAndRome.dto";
import { SearchImmersionRequestDto } from "shared/src/searchImmersion/SearchImmersionRequest.dto";

const counterFormEstablishmentCaller = new promClient.Counter({
  name: "form_establishment_v1_callers_counter",
  help: "The total count form establishment adds, broken down by referer.",
  labelNames: ["referer"],
});

export const createApiKeyAuthRouterV1 = (deps: AppDependencies) => {
  const publicV1Router = Router({ mergeParams: true });

  publicV1Router.use(deps.apiKeyAuthMiddleware);

  // Form establishments routes
  publicV1Router.route(`/${formEstablishmentsRoute}`).post(async (req, res) => {
    counterFormEstablishmentCaller.inc({
      referer: req.get("Referrer"),
    });
    return sendHttpResponse(req, res, () => {
      if (!req.apiConsumer?.isAuthorized) throw new ForbiddenError();

      return pipeWithValue(
        validateAndParseZodSchema(formEstablishmentSchema, req.body),
        (domainFormEstablishmentWithoutSource) =>
          deps.useCases.addFormEstablishment.execute({
            ...domainFormEstablishmentWithoutSource,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            source: req.apiConsumer!.consumer,
          }),
      );
    });
  });
  publicV1Router
    .route(`/${formEstablishmentsRoute}/:jwt`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, () => {
        if (!req.payloads?.establishment) throw new UnauthorizedError();
        return deps.useCases.retrieveFormEstablishmentFromAggregates.execute(
          undefined,
          req.payloads.establishment,
        );
      }),
    );

  publicV1Router
    .route(`/${formEstablishmentsRoute}/:jwt`)
    .post(async (req, res) =>
      sendHttpResponse(req, res, () => {
        if (!req.payloads?.establishment) throw new UnauthorizedError();
        return deps.useCases.editFormEstablishment.execute(
          req.body,
          req.payloads.establishment,
        );
      }),
    );

  // Immersion offers routes
  publicV1Router.route(`/${immersionOffersRoute}`).get(async (req, res) =>
    sendHttpResponse(req, res, async () => {
      const searchImmersionRequestDto: SearchImmersionRequestDto = {
        rome: req.query.rome as string | undefined,
        position: JSON.parse(req.query.position as string),
        distance_km: Number(req.query.distance_km as string),
        voluntaryToImmersion: req.query.voluntaryToImmersion
          ? req.query.voluntaryToImmersion == "true"
          : undefined,
      };

      await deps.useCases.callLaBonneBoiteAndUpdateRepositories.execute(
        searchImmersionRequestDto,
      );
      return deps.useCases.searchImmersion.execute(
        searchImmersionRequestDto,
        req.apiConsumer,
      );
    }),
  );
  publicV1Router
    .route(`/${immersionOffersRoute}/:siret/:rome`)
    .get(async (req, res) =>
      sendHttpResponse(req, res, async () => {
        if (!req.apiConsumer?.isAuthorized) throw new ForbiddenError();
        return deps.useCases.getImmersionOfferBySiretAndRome.execute(
          { siret: req.params.siret, rome: req.params.rome } as SiretAndRomeDto,
          req.apiConsumer,
        );
      }),
    );
  return publicV1Router;
};
