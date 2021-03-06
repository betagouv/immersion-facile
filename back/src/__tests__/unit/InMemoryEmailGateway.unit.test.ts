import { expectArraysToMatch } from "../../_testBuilders/test.helpers";
import { CustomClock } from "../../adapters/secondary/core/ClockImplementations";
import { InMemoryEmailGateway } from "../../adapters/secondary/emailGateway/InMemoryEmailGateway";

describe("In memory EmailGateway", () => {
  let inMemoryEmailGateway: InMemoryEmailGateway;
  let clock: CustomClock;

  beforeEach(() => {
    clock = new CustomClock();
    inMemoryEmailGateway = new InMemoryEmailGateway(clock, 1);
  });

  it("should be able to retrieve last email sent", async () => {
    clock.setNextDate(new Date("2022-01-01T12:00:00.000Z"));
    await inMemoryEmailGateway.sendEmail({
      type: "SUGGEST_EDIT_FORM_ESTABLISHMENT",
      recipients: ["establishment-ceo@gmail.com"],
      params: { editFrontUrl: "plop" },
    });

    await expectArraysToMatch(inMemoryEmailGateway.getLastSentEmailDtos(), [
      {
        sentAt: "2022-01-01T12:00:00.000Z",
        templatedEmail: {
          params: {
            editFrontUrl: "plop",
          },
          recipients: ["establishment-ceo@gmail.com"],
          type: "SUGGEST_EDIT_FORM_ESTABLISHMENT",
        },
      },
    ]);
  });

  it("should be able to retrieve at most the given maximum of emails", async () => {
    clock.setNextDate(new Date("2022-01-01T12:00:00.000Z"));
    await inMemoryEmailGateway.sendEmail({
      type: "SUGGEST_EDIT_FORM_ESTABLISHMENT",
      recipients: ["establishment-ceo@gmail.com"],
      params: { editFrontUrl: "plop" },
    });
    await inMemoryEmailGateway.sendEmail({
      type: "SUGGEST_EDIT_FORM_ESTABLISHMENT",
      recipients: ["other-ceo@gmail.com"],
      params: { editFrontUrl: "other-mail" },
    });

    const sentEmails = inMemoryEmailGateway.getLastSentEmailDtos();
    expect(sentEmails).toHaveLength(1);
    await expectArraysToMatch(sentEmails, [
      {
        sentAt: "2022-01-01T12:00:00.000Z",
        templatedEmail: {
          params: {
            editFrontUrl: "other-mail",
          },
          recipients: ["other-ceo@gmail.com"],
          type: "SUGGEST_EDIT_FORM_ESTABLISHMENT",
        },
      },
    ]);
  });
});
