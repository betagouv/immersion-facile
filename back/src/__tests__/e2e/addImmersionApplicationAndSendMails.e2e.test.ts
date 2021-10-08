import { CustomClock } from "../../adapters/secondary/core/ClockImplementations";
import { BasicEventCrawler } from "../../adapters/secondary/core/EventCrawlerImplementations";
import { InMemoryOutboxRepository } from "../../adapters/secondary/core/InMemoryOutboxRepository";
import { TestUuidGenerator } from "../../adapters/secondary/core/UuidGeneratorImplementations";
import {
  InMemoryEmailGateway,
  TemplatedEmail,
} from "../../adapters/secondary/InMemoryEmailGateway";
import { InMemoryEventBus } from "../../adapters/secondary/InMemoryEventBus";
import { InMemoryImmersionApplicationRepository } from "../../adapters/secondary/InMemoryImmersionApplicationRepository";
import {
  CreateNewEvent,
  EventBus,
  makeCreateNewEvent,
} from "../../domain/core/eventBus/EventBus";
import { OutboxRepository } from "../../domain/core/ports/OutboxRepository";
import { AddImmersionApplication } from "../../domain/immersionApplication/useCases/AddImmersionApplication";
import { ConfirmToBeneficiaryThatApplicationCorrectlySubmitted } from "../../domain/immersionApplication/useCases/notifications/ConfirmToBeneficiaryThatApplicationCorrectlySubmitted";
import { ConfirmToMentorThatApplicationCorrectlySubmitted } from "../../domain/immersionApplication/useCases/notifications/ConfirmToMentorThatApplicationCorrectlySubmitted";
import { NotifyAllActorsOfFinalApplicationValidation } from "../../domain/immersionApplication/useCases/notifications/NotifyAllActorsOfFinalApplicationValidation";
import { NotifyToTeamApplicationSubmittedByBeneficiary } from "../../domain/immersionApplication/useCases/notifications/NotifyToTeamApplicationSubmittedByBeneficiary";
import { ValidateImmersionApplication } from "../../domain/immersionApplication/useCases/ValidateImmersionApplication";
import { AgencyCode } from "../../shared/agencies";
import { ImmersionApplicationDto } from "../../shared/ImmersionApplicationDto";
import {
  expectEmailAdminNotificationMatchingImmersionApplication,
  expectEmailBeneficiaryConfirmationMatchingImmersionApplication,
  expectEmailFinalValidationConfirmationMatchingImmersionApplication,
  expectEmailMentorConfirmationMatchingImmersionApplication,
} from "../../_testBuilders/emailAssertions";
import { ImmersionApplicationDtoBuilder } from "../../_testBuilders/ImmersionApplicationDtoBuilder";

describe("Add immersionApplication Notifications, then checks the mails are sent (trigerred by events)", () => {
  let addDemandeImmersion: AddImmersionApplication;
  let validateDemandeImmersion: ValidateImmersionApplication;
  let applicationRepository: InMemoryImmersionApplicationRepository;
  let outboxRepository: OutboxRepository;
  let clock: CustomClock;
  let uuidGenerator: TestUuidGenerator;
  let createNewEvent: CreateNewEvent;
  let emailGw: InMemoryEmailGateway;
  let confirmToBeneficiary: ConfirmToBeneficiaryThatApplicationCorrectlySubmitted;
  let confirmToMentor: ConfirmToMentorThatApplicationCorrectlySubmitted;
  let notifyToTeam: NotifyToTeamApplicationSubmittedByBeneficiary;
  let validDemandeImmersion: ImmersionApplicationDto;
  let eventBus: EventBus;
  let eventCrawler: BasicEventCrawler;
  let aSupervisorEmail: string;
  let emailAllowList: Set<string>;
  let unrestrictedEmailSendingAgencies: Set<AgencyCode>;
  let sentEmails: TemplatedEmail[];

  beforeEach(() => {
    applicationRepository = new InMemoryImmersionApplicationRepository();
    outboxRepository = new InMemoryOutboxRepository();
    clock = new CustomClock();
    uuidGenerator = new TestUuidGenerator();
    createNewEvent = makeCreateNewEvent({ clock, uuidGenerator });
    emailGw = new InMemoryEmailGateway();
    validDemandeImmersion = new ImmersionApplicationDtoBuilder().build();
    eventBus = new InMemoryEventBus();
    eventCrawler = new BasicEventCrawler(eventBus, outboxRepository);

    addDemandeImmersion = new AddImmersionApplication(
      applicationRepository,
      createNewEvent,
      outboxRepository,
    );
    validateDemandeImmersion = new ValidateImmersionApplication(
      applicationRepository,
      createNewEvent,
      outboxRepository,
    );

    aSupervisorEmail = "supervisor@email.fr";
    emailAllowList = new Set([
      validDemandeImmersion.email,
      validDemandeImmersion.mentorEmail,
    ]);
    unrestrictedEmailSendingAgencies = new Set();

    confirmToBeneficiary =
      new ConfirmToBeneficiaryThatApplicationCorrectlySubmitted(
        emailGw,
        emailAllowList,
        unrestrictedEmailSendingAgencies,
      );

    confirmToMentor = new ConfirmToMentorThatApplicationCorrectlySubmitted(
      emailGw,
      emailAllowList,
      unrestrictedEmailSendingAgencies,
    );

    notifyToTeam = new NotifyToTeamApplicationSubmittedByBeneficiary(
      emailGw,
      aSupervisorEmail,
    );
  });

  //Creates a DemandeImmersion, check it is saved properly and that event had been triggered (thanks to subscription),
  // t hen check mails have been sent trough the inmemory mail gateway
  test("saves valid applications in the repository", async () => {
    addDemandeImmersion = new AddImmersionApplication(
      applicationRepository,
      createNewEvent,
      outboxRepository,
    );

    eventBus.subscribe("ImmersionApplicationSubmittedByBeneficiary", (event) =>
      confirmToBeneficiary.execute(event.payload),
    );

    eventBus.subscribe("ImmersionApplicationSubmittedByBeneficiary", (event) =>
      confirmToMentor.execute(event.payload),
    );

    eventBus.subscribe("ImmersionApplicationSubmittedByBeneficiary", (event) =>
      notifyToTeam.execute(event.payload),
    );

    // We expect this execute to trigger an event on ImmersionApplicationSubmittedByBeneficiary topic
    const result = await addDemandeImmersion.execute(validDemandeImmersion);
    expect(result).toEqual({ id: validDemandeImmersion.id });

    // the following line triggers the eventCrawler (in prod it would be triggered every 10sec or so)
    await eventCrawler.processEvents();

    sentEmails = emailGw.getSentEmails();
    expect(sentEmails).toHaveLength(3);

    expectEmailBeneficiaryConfirmationMatchingImmersionApplication(
      sentEmails[0],
      validDemandeImmersion,
    );

    expectEmailMentorConfirmationMatchingImmersionApplication(
      sentEmails[1],
      validDemandeImmersion,
    );

    expectEmailAdminNotificationMatchingImmersionApplication(sentEmails[2], {
      recipient: "supervisor@email.fr",
      immersionApplication: validDemandeImmersion,
    });
  });

  test("Checks than when a conselor updates an Immersion Application to confirm it, the proper emails are sent to Beneficiary, mentor & team", async () => {
    const demandeImmersionInReview = new ImmersionApplicationDtoBuilder()
      .withStatus("IN_REVIEW")
      .build();

    const result = await addDemandeImmersion.execute(demandeImmersionInReview);

    const counsellorEmail = "counsellor@email.fr";
    const counsellorEmails = {
      [demandeImmersionInReview.agencyCode]: [counsellorEmail],
    } as Record<AgencyCode, string[]>;

    const sendConventionToAllActors =
      new NotifyAllActorsOfFinalApplicationValidation(
        emailGw,
        emailAllowList,
        unrestrictedEmailSendingAgencies,
        counsellorEmails,
      );

    eventBus.subscribe("FinalImmersionApplicationValidationByAdmin", (event) =>
      sendConventionToAllActors.execute(event.payload),
    );

    // We expect this execute to trigger an event on ImmersionApplicationSubmittedByBeneficiary topic
    const resultValidate = await validateDemandeImmersion.execute(result.id);
    expect(resultValidate).toEqual({ id: demandeImmersionInReview.id });

    // the following line triggers the eventCrawler (in prod it would be triggered every 10sec or so)
    await eventCrawler.processEvents();

    sentEmails = emailGw.getSentEmails();
    expect(sentEmails).toHaveLength(1);

    unrestrictedEmailSendingAgencies.add(demandeImmersionInReview.agencyCode);

    await sendConventionToAllActors.execute(demandeImmersionInReview);

    // Expecting 2 emails as we got one when we initially created the application
    expect(sentEmails).toHaveLength(2);
    expectEmailFinalValidationConfirmationMatchingImmersionApplication(
      [
        demandeImmersionInReview.email,
        demandeImmersionInReview.mentorEmail,
        counsellorEmail,
      ],
      sentEmails[1],
      demandeImmersionInReview,
    );
  });
});