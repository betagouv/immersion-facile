import { NotFoundError } from "../../../adapters/primary/helpers/sendHttpResponse";
import { FeatureFlags } from "../../../shared/featureFlags";
import {
  UpdateImmersionApplicationRequestDto,
  updateImmersionApplicationRequestDtoSchema,
  UpdateImmersionApplicationResponseDto,
} from "../../../shared/ImmersionApplicationDto";
import { CreateNewEvent } from "../../core/eventBus/EventBus";
import { OutboxRepository } from "../../core/ports/OutboxRepository";
import { UseCase } from "../../core/UseCase";
import { ImmersionApplicationEntity } from "../entities/ImmersionApplicationEntity";
import { ImmersionApplicationRepository } from "../ports/ImmersionApplicationRepository";

export class UpdateImmersionApplication extends UseCase<
  UpdateImmersionApplicationRequestDto,
  UpdateImmersionApplicationResponseDto
> {
  constructor(
    private readonly createNewEvent: CreateNewEvent,
    private readonly outboxRepository: OutboxRepository,
    private readonly immersionApplicationRepository: ImmersionApplicationRepository,
    private readonly featureFlags: FeatureFlags,
  ) {
    super();
  }

  inputSchema = updateImmersionApplicationRequestDtoSchema;

  public async _execute(
    params: UpdateImmersionApplicationRequestDto,
  ): Promise<UpdateImmersionApplicationResponseDto> {
    const immersionApplicationEntity = ImmersionApplicationEntity.create(
      params.demandeImmersion,
    );
    const id =
      await this.immersionApplicationRepository.updateImmersionApplication(
        immersionApplicationEntity,
      );
    if (!id) throw new NotFoundError(params.id);

    if (params.demandeImmersion.status == "IN_REVIEW") {
      // So far we are in the case where a beneficiary made an update on an Immersion Application, and we just need to review it for eligibility
      const event = this.createNewEvent({
        topic: "ImmersionApplicationSubmittedByBeneficiary",
        payload: params.demandeImmersion,
      });

      await this.outboxRepository.save(event);
    }

    return { id };
  }
}
