import { z } from "zod";
import { UnitOfWork, UnitOfWorkPerformer } from "../../core/ports/UnitOfWork";
import { TransactionalUseCase } from "../../core/UseCase";
import { ExportDataDto, GetExportableParams } from "shared/src/exportable";

import { ExportGateway } from "../ports/ExportGateway";
import { keys } from "ramda";

const exportableSchema: z.ZodSchema<GetExportableParams> = z.any();

export class ExportData extends TransactionalUseCase<ExportDataDto, string> {
  inputSchema = z.object({
    exportableParams: exportableSchema,
    fileName: z.string(),
  });

  constructor(
    uowPerformer: UnitOfWorkPerformer,
    private exportGateway: ExportGateway,
  ) {
    super(uowPerformer);
  }

  protected async _execute(
    { exportableParams: exportable, fileName }: ExportDataDto,
    uow: UnitOfWork,
  ): Promise<string> {
    const dataToExport = await uow.exportQueries.getFromExportable(exportable);

    if (keys(dataToExport).length === 0) throw new Error("No data to export");

    const archivePath = await this.exportGateway.save(dataToExport, fileName);
    return archivePath;
  }
}
