import { SiretDto } from "shared/src/siret";
import { sleep } from "shared/src/utils";
import {
  GenerateAdminJwt,
  GenerateMagicLinkJwt,
} from "../../../domain/auth/jwt";
import { ExportData } from "../../../domain/backoffice/useCases/ExportData";
import { AddAgency } from "../../../domain/convention/useCases/AddAgency";
import { AddImmersionApplication } from "../../../domain/convention/useCases/AddImmersionApplication";
import { BroadcastToPoleEmploiOnConventionUpdates } from "../../../domain/convention/useCases/broadcast/BroadcastToPoleEmploiOnConventionUpdates";
import { CreateImmersionAssessment } from "../../../domain/convention/useCases/CreateImmersionAssessment";
import { GenerateMagicLink } from "../../../domain/convention/useCases/GenerateMagicLink";
import { GetAgencyPublicInfoById } from "../../../domain/convention/useCases/GetAgencyPublicInfoById";
import { GetConvention } from "../../../domain/convention/useCases/GetConvention";
import { ListAdminConventions } from "../../../domain/convention/useCases/ListAdminConventions";
import { ListAgenciesWithPosition } from "../../../domain/convention/useCases/ListAgenciesWithPosition";
import { ConfirmToBeneficiaryThatApplicationCorrectlySubmittedRequestSignature } from "../../../domain/convention/useCases/notifications/ConfirmToBeneficiaryThatApplicationCorrectlySubmittedRequestSignature";
import { ConfirmToMentorThatApplicationCorrectlySubmittedRequestSignature } from "../../../domain/convention/useCases/notifications/ConfirmToMentorThatApplicationCorrectlySubmittedRequestSignature";
import { DeliverRenewedMagicLink } from "../../../domain/convention/useCases/notifications/DeliverRenewedMagicLink";
import { NotifyAllActorsOfFinalApplicationValidation } from "../../../domain/convention/useCases/notifications/NotifyAllActorsOfFinalApplicationValidation";
import { NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected } from "../../../domain/convention/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected";
import { NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification } from "../../../domain/convention/useCases/notifications/NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification";
import { NotifyImmersionApplicationWasSignedByOtherParty } from "../../../domain/convention/useCases/notifications/NotifyImmersionApplicationWasSignedByOtherParty";
import { NotifyNewApplicationNeedsReview } from "../../../domain/convention/useCases/notifications/NotifyNewApplicationNeedsReview";
import { NotifyToAgencyApplicationSubmitted } from "../../../domain/convention/useCases/notifications/NotifyToAgencyApplicationSubmitted";
import { PrivateListAgencies } from "../../../domain/convention/useCases/PrivateListAgencies";
import { RenewConventionMagicLink } from "../../../domain/convention/useCases/RenewConventionMagicLink";
import { SendEmailWhenAgencyIsActivated } from "../../../domain/convention/useCases/SendEmailWhenAgencyIsActivated";
import { ShareApplicationLinkByEmail } from "../../../domain/convention/useCases/ShareApplicationLinkByEmail";
import { SignImmersionApplication } from "../../../domain/convention/useCases/SignImmersionApplication";
import { UpdateAgency } from "../../../domain/convention/useCases/UpdateAgency";
import { UpdateImmersionApplication } from "../../../domain/convention/useCases/UpdateImmersionApplication";
import { UpdateImmersionApplicationStatus } from "../../../domain/convention/useCases/UpdateImmersionApplicationStatus";
import { makeCreateNewEvent } from "../../../domain/core/eventBus/EventBus";
import { Clock } from "../../../domain/core/ports/Clock";
import { noRateLimit } from "../../../domain/core/ports/RateLimiter";
import { noRetries } from "../../../domain/core/ports/RetryStrategy";
import { UnitOfWorkPerformer } from "../../../domain/core/ports/UnitOfWork";
import { UuidGenerator } from "../../../domain/core/ports/UuidGenerator";
import { ApiConsumerId } from "../../../domain/core/valueObjects/ApiConsumer";
import { AdminLogin } from "../../../domain/generic/authentication/useCases/AdminLogin";
import { UploadFile } from "../../../domain/generic/fileManagement/useCases/UploadFile";
import { GetSentEmails } from "../../../domain/generic/notifications/useCases/GetSentEmails";
import { AddFormEstablishment } from "../../../domain/immersionOffer/useCases/AddFormEstablishment";
import { CallLaBonneBoiteAndUpdateRepositories } from "../../../domain/immersionOffer/useCases/CallLaBonneBoiteAndUpdateRepositories";
import { ContactEstablishment } from "../../../domain/immersionOffer/useCases/ContactEstablishment";
import { EditFormEstablishment } from "../../../domain/immersionOffer/useCases/EditFormEstablishment";
import { GetImmersionOfferById } from "../../../domain/immersionOffer/useCases/GetImmersionOfferById";
import { GetImmersionOfferBySiretAndRome } from "../../../domain/immersionOffer/useCases/GetImmersionOfferBySiretAndRome";
import { InsertEstablishmentAggregateFromForm } from "../../../domain/immersionOffer/useCases/InsertEstablishmentAggregateFromFormEstablishement";
import { NotifyConfirmationEstablishmentCreated } from "../../../domain/immersionOffer/useCases/notifications/NotifyConfirmationEstablishmentCreated";
import { NotifyContactRequest } from "../../../domain/immersionOffer/useCases/notifications/NotifyContactRequest";
import { NotifyPassEmploiOnNewEstablishmentAggregateInsertedFromForm } from "../../../domain/immersionOffer/useCases/notifications/NotifyPassEmploiOnNewEstablishmentAggregateInsertedFromForm";
import { RequestEditFormEstablishment } from "../../../domain/immersionOffer/useCases/RequestEditFormEstablishment";
import { RetrieveFormEstablishmentFromAggregates } from "../../../domain/immersionOffer/useCases/RetrieveFormEstablishmentFromAggregates";
import { SearchImmersion } from "../../../domain/immersionOffer/useCases/SearchImmersion";
import { UpdateEstablishmentAggregateFromForm } from "../../../domain/immersionOffer/useCases/UpdateEstablishmentAggregateFromFormEstablishement";
import { AssociatePeConnectFederatedIdentity } from "../../../domain/peConnect/useCases/AssociateFederatedIdentityPeConnect";
import { LinkPoleEmploiAdvisorAndRedirectToConvention } from "../../../domain/peConnect/useCases/LinkPoleEmploiAdvisorAndRedirectToConvention";
import { NotifyPoleEmploiUserAdvisorOnConventionAssociation } from "../../../domain/peConnect/useCases/NotifyPoleEmploiUserAdvisorOnConventionAssociation";
import { NotifyPoleEmploiUserAdvisorOnConventionFullySigned } from "../../../domain/peConnect/useCases/NotifyPoleEmploiUserAdvisorOnConventionFullySigned";
import { AppellationSearch } from "../../../domain/rome/useCases/AppellationSearch";
import { RomeSearch } from "../../../domain/rome/useCases/RomeSearch";
import { GetSiret } from "../../../domain/sirene/useCases/GetSiret";
import { GetSiretIfNotAlreadySaved } from "../../../domain/sirene/useCases/GetSiretIfNotAlreadySaved";
import { HttpAdresseAPI } from "../../secondary/immersionOffer/HttpAdresseAPI";
import { AppConfig } from "./appConfig";
import { Gateways } from "./createGateways";
import { GenerateConventionMagicLink } from "./createGenerateConventionMagicLink";
import { makeGenerateEditFormEstablishmentUrl } from "./makeGenerateEditFormEstablishmentUrl";

export type UseCases = ReturnType<typeof createUseCases>;

export const createUseCases = (
  config: AppConfig,
  gateways: Gateways,
  generateJwtFn: GenerateMagicLinkJwt,
  generateMagicLinkFn: GenerateConventionMagicLink,
  generateAdminJwt: GenerateAdminJwt,
  uowPerformer: UnitOfWorkPerformer,
  clock: Clock,
  uuidGenerator: UuidGenerator,
) => {
  const createNewEvent = makeCreateNewEvent({
    clock,
    uuidGenerator,
    quarantinedTopics: config.quarantinedTopics,
  });
  const getSiret = new GetSiret(gateways.sirene);
  const adresseAPI = new HttpAdresseAPI(noRateLimit, noRetries);

  return {
    associatePeConnectFederatedIdentity:
      new AssociatePeConnectFederatedIdentity(uowPerformer, createNewEvent),
    uploadFile: new UploadFile(uowPerformer, gateways.documentGateway),

    // Admin
    adminLogin: new AdminLogin(
      config.backofficeUsername,
      config.backofficePassword,
      generateAdminJwt,
      () => sleep(config.nodeEnv !== "test" ? 500 : 0),
    ),
    getSentEmails: new GetSentEmails(gateways.email),
    exportData: new ExportData(uowPerformer, gateways.exportGateway),

    // Conventions
    createImmersionAssessment: new CreateImmersionAssessment(
      uowPerformer,
      createNewEvent,
    ),
    addConvention: new AddImmersionApplication(
      uowPerformer,
      createNewEvent,
      getSiret,
    ),
    getConvention: new GetConvention(uowPerformer),
    linkPoleEmploiAdvisorAndRedirectToConvention:
      new LinkPoleEmploiAdvisorAndRedirectToConvention(
        uowPerformer,
        gateways.peConnectGateway,
        config.immersionFacileBaseUrl,
      ),
    listAdminConventions: new ListAdminConventions(uowPerformer),

    updateConvention: new UpdateImmersionApplication(
      uowPerformer,
      createNewEvent,
    ),
    updateConventionStatus: new UpdateImmersionApplicationStatus(
      uowPerformer,
      createNewEvent,
      clock,
    ),
    signConvention: new SignImmersionApplication(uowPerformer, createNewEvent),
    generateMagicLink: new GenerateMagicLink(generateJwtFn),
    renewConventionMagicLink: new RenewConventionMagicLink(
      uowPerformer,
      createNewEvent,
      generateJwtFn,
      config,
      clock,
    ),

    // immersionOffer
    searchImmersion: new SearchImmersion(uowPerformer, uuidGenerator),
    getImmersionOfferById: new GetImmersionOfferById(uowPerformer),
    getImmersionOfferBySiretAndRome: new GetImmersionOfferBySiretAndRome(
      uowPerformer,
    ),

    addFormEstablishment: new AddFormEstablishment(
      uowPerformer,
      createNewEvent,
      getSiret,
    ),

    editFormEstablishment: new EditFormEstablishment(
      uowPerformer,
      createNewEvent,
    ),
    retrieveFormEstablishmentFromAggregates:
      new RetrieveFormEstablishmentFromAggregates(uowPerformer),
    updateEstablishmentAggregateFromForm:
      new UpdateEstablishmentAggregateFromForm(
        uowPerformer,
        gateways.sirene,
        adresseAPI,
        uuidGenerator,
        clock,
      ),
    insertEstablishmentAggregateFromForm:
      new InsertEstablishmentAggregateFromForm(
        uowPerformer,
        gateways.sirene,
        adresseAPI,
        uuidGenerator,
        clock,
        createNewEvent,
      ),
    contactEstablishment: new ContactEstablishment(
      uowPerformer,
      createNewEvent,
    ),

    callLaBonneBoiteAndUpdateRepositories:
      new CallLaBonneBoiteAndUpdateRepositories(
        uowPerformer,
        gateways.laBonneBoiteAPI,
        clock,
      ),
    requestEditFormEstablishment: new RequestEditFormEstablishment(
      uowPerformer,
      gateways.email,
      clock,
      makeGenerateEditFormEstablishmentUrl(config),
      createNewEvent,
    ),

    notifyPassEmploiOnNewEstablishmentAggregateInsertedFromForm:
      new NotifyPassEmploiOnNewEstablishmentAggregateInsertedFromForm(
        gateways.passEmploiGateway,
      ),

    // siret
    getSiret,
    getSiretIfNotAlreadySaved: new GetSiretIfNotAlreadySaved(
      uowPerformer,
      gateways.sirene,
    ),

    // romes
    appellationSearch: new AppellationSearch(uowPerformer),
    romeSearch: new RomeSearch(uowPerformer),

    // agencies
    listAgenciesWithPosition: new ListAgenciesWithPosition(uowPerformer),
    privateListAgencies: new PrivateListAgencies(uowPerformer),
    getAgencyPublicInfoById: new GetAgencyPublicInfoById(uowPerformer),
    sendEmailWhenAgencyIsActivated: new SendEmailWhenAgencyIsActivated(
      gateways.email,
    ),
    // notifications
    confirmToBeneficiaryThatConventionCorrectlySubmittedRequestSignature:
      new ConfirmToBeneficiaryThatApplicationCorrectlySubmittedRequestSignature(
        gateways.email,
        generateMagicLinkFn,
      ),
    confirmToMentorThatConventionCorrectlySubmittedRequestSignature:
      new ConfirmToMentorThatApplicationCorrectlySubmittedRequestSignature(
        gateways.email,
        generateMagicLinkFn,
      ),
    notifyAllActorsOfFinalConventionValidation:
      new NotifyAllActorsOfFinalApplicationValidation(
        uowPerformer,
        gateways.email,
      ),
    notifyNewConventionNeedsReview: new NotifyNewApplicationNeedsReview(
      uowPerformer,
      gateways.email,
      generateMagicLinkFn,
    ),
    notifyToAgencyConventionSubmitted: new NotifyToAgencyApplicationSubmitted(
      uowPerformer,
      gateways.email,
      generateMagicLinkFn,
    ),
    notifyBeneficiaryAndEnterpriseThatConventionIsRejected:
      new NotifyBeneficiaryAndEnterpriseThatApplicationIsRejected(
        uowPerformer,
        gateways.email,
      ),
    notifyBeneficiaryAndEnterpriseThatConventionNeedsModifications:
      new NotifyBeneficiaryAndEnterpriseThatApplicationNeedsModification(
        uowPerformer,
        gateways.email,
        generateMagicLinkFn,
      ),
    deliverRenewedMagicLink: new DeliverRenewedMagicLink(gateways.email),
    notifyConfirmationEstablishmentCreated:
      new NotifyConfirmationEstablishmentCreated(gateways.email),
    notifyContactRequest: new NotifyContactRequest(
      uowPerformer,
      gateways.email,
    ),
    notifyBeneficiaryOrEnterpriseThatConventionWasSignedByOtherParty:
      new NotifyImmersionApplicationWasSignedByOtherParty(
        gateways.email,
        generateMagicLinkFn,
      ),
    notifyPoleEmploiUserAdvisorOnAssociation:
      new NotifyPoleEmploiUserAdvisorOnConventionAssociation(
        uowPerformer,
        gateways.email,
        generateMagicLinkFn,
      ),
    notifyPoleEmploiUserAdvisorOnConventionFullySigned:
      new NotifyPoleEmploiUserAdvisorOnConventionFullySigned(
        uowPerformer,
        gateways.email,
        generateMagicLinkFn,
      ),
    broadcastToPoleEmploiOnConventionUpdates:
      new BroadcastToPoleEmploiOnConventionUpdates(
        uowPerformer,
        gateways.poleEmploiGateway,
      ),
    shareConventionByEmail: new ShareApplicationLinkByEmail(gateways.email),
    addAgency: new AddAgency(
      uowPerformer,
      createNewEvent,
      config.defaultAdminEmail,
    ),
    updateAgency: new UpdateAgency(uowPerformer, createNewEvent),
    getFeatureFlags: () => uowPerformer.perform((uow) => uow.getFeatureFlags()),
    getApiConsumerById: (id: ApiConsumerId) =>
      uowPerformer.perform((uow) => uow.getApiConsumersById(id)),
    isFormEstablishmentWithSiretAlreadySaved: (siret: SiretDto) =>
      uowPerformer.perform((uow) =>
        uow.establishmentAggregateRepository.hasEstablishmentFromFormWithSiret(
          siret,
        ),
      ),
    getImmersionFacileAgencyIdByKind: () =>
      uowPerformer.perform((uow) =>
        uow.agencyRepository.getImmersionFacileAgencyId(),
      ),
  };
};
