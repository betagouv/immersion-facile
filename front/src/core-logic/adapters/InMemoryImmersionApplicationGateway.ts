import { decodeJwt } from "src/core-logic/adapters/decodeJwt";
import { ImmersionApplicationGateway } from "src/core-logic/ports/ImmersionApplicationGateway";
import { AgencyDto } from "src/shared/agencies";
import {
  ApplicationStatus,
  ImmersionApplicationDto,
  ImmersionApplicationId,
  IMMERSION_APPLICATION_TEMPLATE,
  UpdateImmersionApplicationStatusRequestDto,
  UpdateImmersionApplicationStatusResponseDto,
  signApplicationDtoWithRole,
} from "src/shared/ImmersionApplicationDto";
import { LatLonDto } from "src/shared/SearchImmersionDto";
import { GetSiretResponseDto, SiretDto } from "src/shared/siret";
import { Role } from "src/shared/tokens/MagicLinkPayload";
import { sleep } from "src/shared/utils";
import { AgencyId } from "../../shared/agencies";

const TEST_AGENCIES: AgencyDto[] = [
  {
    id: "test-agency-1-front",
    name: "Test Agency 1 (front)",
    position: {
      lat: 1.0,
      lon: 2.0,
    },
  },
  {
    id: "test-agency-2-front",
    name: "Test Agency 2 (front)",
    position: {
      lat: 30.0,
      lon: 20.0,
    },
  },
  {
    id: "test-agency-3-front",
    name: "Test Agency 3 (front)",
    position: {
      lat: 74.0,
      lon: 2.0,
    },
  },
];

const TEST_ESTABLISHMENTS: GetSiretResponseDto[] = [
  {
    siret: "12345678901234",
    businessName: "MA P'TITE BOITE",
    businessAddress: "20 AVENUE DE SEGUR 75007 PARIS 7",
    naf: {
      code: "78.3Z",
      nomenclature: "Ref2",
    },
    isOpen: true,
  },
  {
    siret: "11111111111111",
    businessName: "ALAIN PROST",
    businessAddress: "CHALET SECRET 73550 MERIBEL",
    isOpen: true,
  },
];

const SIMULATED_LATENCY_MS = 2000;
export class InMemoryImmersionApplicationGateway extends ImmersionApplicationGateway {
  private _immersionApplications: { [id: string]: ImmersionApplicationDto } =
    {};
  private _establishments: { [siret: string]: GetSiretResponseDto } = {};
  private _agencies: { [id: string]: AgencyDto } = {};

  public constructor() {
    super();
    TEST_AGENCIES.forEach((agency) => (this._agencies[agency.id] = agency));
    this.add({
      ...IMMERSION_APPLICATION_TEMPLATE,
      id: "valid_draft",
      status: "DRAFT",
      email: "DRAFT.esteban@ocon.fr",
      agencyId: TEST_AGENCIES[0].id,
    });
    this.add({
      ...IMMERSION_APPLICATION_TEMPLATE,
      id: "valid_in_review",
      status: "IN_REVIEW",
      email: "IN_REVIEW.esteban@ocon.fr",
      agencyId: TEST_AGENCIES[1].id,
    });

    TEST_ESTABLISHMENTS.forEach(
      (establishment) =>
        (this._establishments[establishment.siret] = establishment),
    );
  }

  public async add(
    immersionApplication: ImmersionApplicationDto,
  ): Promise<ImmersionApplicationId> {
    console.log(
      "InMemoryImmersionApplicationGateway.add: ",
      immersionApplication,
    );
    await sleep(SIMULATED_LATENCY_MS);
    this._immersionApplications[immersionApplication.id] = immersionApplication;
    return immersionApplication.id;
  }

  public async backofficeGet(
    id: ImmersionApplicationId,
  ): Promise<ImmersionApplicationDto> {
    console.log("InMemoryImmersionApplicationGateway.get: ", id);
    await sleep(SIMULATED_LATENCY_MS);
    return this._immersionApplications[id];
  }

  // Same as GET above, but using a magic link
  public async getML(jwt: string): Promise<ImmersionApplicationDto> {
    await sleep(SIMULATED_LATENCY_MS);

    const payload = decodeJwt(jwt);
    return this._immersionApplications[payload.applicationId];
  }

  public async getAll(
    agency?: AgencyId,
    status?: ApplicationStatus,
  ): Promise<Array<ImmersionApplicationDto>> {
    console.log("InMemoryImmersionApplicationGateway.getAll: ", agency, status);
    await sleep(SIMULATED_LATENCY_MS);

    return Object.values(this._immersionApplications)
      .filter((application) => !agency || application.agencyId === agency)
      .filter((application) => !status || application.status === status);
  }

  public async update(
    immersionApplication: ImmersionApplicationDto,
  ): Promise<ImmersionApplicationId> {
    console.log(
      "InMemoryImmersionApplicationGateway.update: ",
      immersionApplication,
    );
    await sleep(SIMULATED_LATENCY_MS);
    this._immersionApplications[immersionApplication.id] = immersionApplication;
    return immersionApplication.id;
  }

  public async updateML(
    immersionApplication: ImmersionApplicationDto,
    jwt: string,
  ): Promise<string> {
    console.log(
      "InMemoryImmersionApplicationGateway.updateML: ",
      immersionApplication,
    );
    const payload = decodeJwt(jwt);

    await sleep(SIMULATED_LATENCY_MS);
    this._immersionApplications[payload.applicationId] = immersionApplication;
    return immersionApplication.id;
  }

  public async updateStatus(
    { status, justification }: UpdateImmersionApplicationStatusRequestDto,
    jwt: string,
  ): Promise<UpdateImmersionApplicationStatusResponseDto> {
    const payload = decodeJwt(jwt);
    await sleep(SIMULATED_LATENCY_MS);
    this._immersionApplications[payload.applicationId] = {
      ...this._immersionApplications[payload.applicationId],
      status,
    };
    return { id: payload.applicationId };
  }

  public async signApplication(
    jwt: string,
  ): Promise<UpdateImmersionApplicationStatusResponseDto> {
    await sleep(SIMULATED_LATENCY_MS);
    const payload = decodeJwt(jwt);
    const application = this._immersionApplications[payload.applicationId];
    this._immersionApplications[payload.applicationId] =
      signApplicationDtoWithRole(application, payload.role);
    return { id: payload.applicationId };
  }

  public async validate(id: ImmersionApplicationId): Promise<string> {
    console.log("InMemoryImmersionApplicationGateway.validate: ", id);
    await sleep(SIMULATED_LATENCY_MS);
    let form = { ...this._immersionApplications[id] };
    if (form.status === "IN_REVIEW") {
      form.status = "VALIDATED";
      this._immersionApplications[id] = form;
    } else {
      throw new Error("400 Bad Request");
    }
    return id;
  }

  public async generateMagicLink(
    applicationId: ImmersionApplicationId,
    role: Role,
  ): Promise<string> {
    // TODO: generate actual JWTs here
    throw new Error("500 Not Implemented In InMemory Gateway");
    return "";
  }

  public async renewMagicLink(
    expiredJwt: string,
    linkFormat: string,
  ): Promise<void> {
    // This is supposed to ask the backend to send a new email to the owner of the expired magic link.
    // Since this operation makes no sense for local development, the implementation here is left empty.
    await sleep(SIMULATED_LATENCY_MS);
    throw new Error("500 Not Implemented In InMemory Gateway");
  }

  public async listAgencies(position: LatLonDto): Promise<AgencyDto[]> {
    const agencies = Object.values(this._agencies);
    await sleep(SIMULATED_LATENCY_MS);
    console.log("InMemoryImmersionApplicationGateway.listAgencies: ", agencies);
    return agencies;
  }

  public async getSiretInfo(siret: SiretDto): Promise<GetSiretResponseDto> {
    console.log(
      "InMemoryImmersionApplicationGateway.getSiretInfo for siret: " + siret,
    );
    await sleep(SIMULATED_LATENCY_MS);

    const establishment = this._establishments[siret];
    console.log(
      "InMemoryImmersionApplicationGateway.getSiretInfo returned: ",
      establishment,
    );

    if (!establishment) {
      throw new Error("404 Not found");
    }

    return establishment;
  }
}
