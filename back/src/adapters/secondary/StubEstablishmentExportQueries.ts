import { format } from "date-fns";
import { FormSourceProvider } from "shared/src/establishmentExport/establishmentExport.dto";
import { EstablishmentExportQueries } from "../../domain/establishment/ports/EstablishmentExportQueries";
import { EstablishmentRawProps } from "../../domain/establishment/valueObjects/EstablishmentRawBeforeExportVO";

export const stubEstablishmentExportQueries: EstablishmentExportQueries = {
  async getEstablishmentsBySourceProviderForExport(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sourceProvider: FormSourceProvider,
  ): Promise<EstablishmentRawProps[]> {
    return establishmentExportQueries.slice(0, 2);
  },
  async getAllEstablishmentsForExport(): Promise<EstablishmentRawProps[]> {
    return establishmentExportQueries;
  },
};

const establishmentExportQueries: EstablishmentRawProps[] = [
  {
    address: "9 PL DE LA VENDEE 85000 LA ROCHE-SUR-YON",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: true,
    nafCode: "7820Z",
    numberEmployeesRange: "250-499",
    name: "ARTUS INTERIM LA ROCHE SUR YON",
    preferredContactMethods: "phone",
    professions: "M1502 - Chargé / Chargée de recrutement",
    siret: "79158476600012",
    contactEmail: "contact@artusinterim.world",
    contactPhone: "0358339542",
  },
  {
    address: "9 PL DE LA VENDEE 85000 LA ROCHE-SUR-YON",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: true,
    nafCode: "7820Z",
    numberEmployeesRange: "250-499",
    name: "ARTUS INTERIM LA ROCHE SUR YON",
    preferredContactMethods: "phone",
    professions: "A1205 - Ouvrier sylviculteur / Ouvrière sylvicutrice",
    siret: "79158476600012",
    contactEmail: "contact@artusinterim.world",
    contactPhone: "0358339542",
  },
  {
    address: "2 RUE JACQUARD 69120 VAULX-EN-VELIN",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: false,
    nafCode: "9321Z",
    numberEmployeesRange: "250-499",
    name: "MINI WORLD LYON",
    preferredContactMethods: "mail",
    professions:
      "I1304 - Technicien(ne) de maintenance industrielle polyvalente",
    siret: "79341726200037",
    contactEmail: "rec@miniworld-lyon.com",
    contactPhone: "0938339542",
  },
  {
    address: "2 RUE JACQUARD 69120 VAULX-EN-VELIN",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: false,
    nafCode: "9321Z",
    numberEmployeesRange: "250-499",
    name: "MINI WORLD LYON",
    preferredContactMethods: "mail",
    professions: "G1205 - Agent / Agente d'exploitation des attractions",
    siret: "79341726200037",
    contactEmail: "rec@miniworld-lyon.com",
    contactPhone: "0938339542",
  },
  {
    address: "2 RUE JACQUARD 69120 VAULX-EN-VELIN",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: false,
    nafCode: "9321Z",
    name: "MINI WORLD LYON",
    numberEmployeesRange: "250-499",
    preferredContactMethods: "mail",
    professions: "G1205 - Agent / Agente d'exploitation des attractions",
    siret: "79341726200037",
    contactEmail: "rec@miniworld-lyon.com",
    contactPhone: "0938339542",
  },
  {
    address: "2 RUE JACQUARD 69120 VAULX-EN-VELIN",
    createdAt: format(new Date(), "dd/MM/yyyy"),
    customizedName: "Custom name",
    isCommited: false,
    nafCode: "9321Z",
    name: "MINI WORLD LYON",
    numberEmployeesRange: "250-499",
    preferredContactMethods: "mail",
    professions:
      "I1304 - Technicien(ne) maintenance d'équipnts de parcs d'attractions",
    siret: "79341726200037",
    contactEmail: "rec@miniworld-lyon.com",
    contactPhone: "0938339542",
  },
];
