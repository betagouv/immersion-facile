import { AgencyDtoBuilder } from "shared/src/agency/AgencyDtoBuilder";
import { ConventionDto } from "shared/src/convention/convention.dto";
import { ConventionDtoBuilder } from "shared/src/convention/ConventionDtoBuilder";
import { AppConfig } from "../../adapters/primary/config/appConfig";
import {
  createGenerateConventionMagicLink,
  GenerateConventionMagicLink,
} from "../../adapters/primary/config/createGenerateConventionMagicLink";
import { createInMemoryUow } from "../../adapters/primary/config/uowConfig";
import { SendinblueEmailGateway } from "../../adapters/secondary/emailGateway/SendinblueEmailGateway";
import { InMemoryUowPerformer } from "../../adapters/secondary/InMemoryUowPerformer";
import { NotifyNewApplicationNeedsReview } from "../../domain/convention/useCases/notifications/NotifyNewApplicationNeedsReview";

// These tests are not hermetic and not meant for automated testing. They will send emails using
// sendinblue, use up production quota, and fail for uncontrollable reasons such as quota
// errors.
//
// Requires the following environment variables to be set for the tests to pass:
// - SENDINBLUE_API_KEY

const validConvention: ConventionDto = new ConventionDtoBuilder()
  .withEmail("jean-francois.macresy@beta.gouv.fr")
  .withMentorEmail("jean-francois.macresy+mentor@beta.gouv.fr")
  .build();

describe("Notify To 2 Counsellors that an application is available", () => {
  let emailGw: SendinblueEmailGateway;
  let generateMagicLinkFn: GenerateConventionMagicLink;
  let agency;

  beforeEach(() => {
    const config = AppConfig.createFromEnv();
    emailGw = SendinblueEmailGateway.create(
      config.sendinblueApiKey,
      (_) => true,
    );
    generateMagicLinkFn = createGenerateConventionMagicLink(config);
  });

  //eslint-disable-next-line jest/expect-expect
  it("Sends notification mails to check Immersion Application eligibility", async () => {
    const counsellorEmails = [
      "jeanfrancois.macresy@gmail.com",
      "jeanfrancois.macresy+beneficiary@gmail.com",
    ];

    agency = AgencyDtoBuilder.create(validConvention.agencyId)
      .withCounsellorEmails(counsellorEmails)
      .build();

    const uow = createInMemoryUow();
    uow.agencyRepository.setAgencies([agency]);

    const notifyNewApplicationNeedsReview = new NotifyNewApplicationNeedsReview(
      new InMemoryUowPerformer(uow),
      emailGw,
      generateMagicLinkFn,
    );
    await notifyNewApplicationNeedsReview.execute(validConvention);
  });

  // TODO(jfmac)
  // Needs to be re-done with real db
  //eslint-disable-next-line jest/expect-expect
  it("Sends notification mails to check Immersion Application eligibility with a real working immersion", async () => {
    const counsellorEmails = [
      "jeanfrancois.macresy@gmail.com",
      "jean-francois.macresy@beta.gouv.fr",
    ];

    agency = AgencyDtoBuilder.create(validConvention.agencyId)
      .withCounsellorEmails(counsellorEmails)
      .build();

    validConvention.id = "ef725832-c8f9-41e1-974b-44372e6e474c";

    const uow = createInMemoryUow();
    uow.agencyRepository.setAgencies([agency]);

    const notifyNewApplicationNeedsReview = new NotifyNewApplicationNeedsReview(
      new InMemoryUowPerformer(uow),
      emailGw,
      generateMagicLinkFn,
    );
    await notifyNewApplicationNeedsReview.execute(validConvention);
  });

  //eslint-disable-next-line jest/no-conditional-expect, jest/expect-expect
  it("Sends notification mails to check Immersion Application validation  with a real working immersion", async () => {
    const validationEmails = [
      "jeanfrancois.macresy@gmail.com",
      "jean-francois.macresy@beta.gouv.fr",
    ];

    agency = AgencyDtoBuilder.create(validConvention.agencyId)
      .withValidatorEmails(validationEmails)
      .build();
    validConvention.id = "ef725832-c8f9-41e1-974b-44372e6e474c";

    const uow = createInMemoryUow();
    uow.agencyRepository.setAgencies([agency]);

    const notifyNewApplicationNeedsReview = new NotifyNewApplicationNeedsReview(
      new InMemoryUowPerformer(uow),
      emailGw,
      generateMagicLinkFn,
    );
    await notifyNewApplicationNeedsReview.execute(validConvention);
  });
});
