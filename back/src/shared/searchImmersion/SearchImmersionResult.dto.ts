import { ContactMethod } from "../formEstablishment/FormEstablishment.dto";
import { ImmersionOfferId } from "../ImmersionOfferId";
import { LatLonDto } from "../latLon";
import { RomeCode } from "../romeAndAppellationDtos/romeAndAppellation.dto";
import { SiretDto } from "../siret";

export type SearchContactDto = {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  phone: string;
};

export type SearchImmersionResultDto = {
  id: ImmersionOfferId;
  rome: RomeCode;
  romeLabel: string;
  naf: string;
  nafLabel: string;
  siret: SiretDto;
  name: string;
  voluntaryToImmersion: boolean;
  location: LatLonDto;
  address: string;
  city: string;
  contactMode?: ContactMethod;
  distance_m?: number;
  contactDetails?: SearchContactDto;
  numberOfEmployeeRange?: string;
};
