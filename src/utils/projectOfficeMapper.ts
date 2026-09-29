import type {
  CorridorApi,
  Office,
  ProjectOfficeApi,
} from "@/types/projectOffice";

export function mapProjectOffice(
  office: ProjectOfficeApi,
  corridors: CorridorApi[]
): Office {
  const corridor = corridors.find(
    (item) => item.pkCorId === office.fkCorId
  );

  return {
    id: office.pkUnitCode,
    name: office.ProjectOffices ?? "",
    unitCode: office.UnitCode ?? "",
    sapCode: office.SAPProfitCentreCode ?? "",
    corridor:
      corridor?.CorridorName ||
      corridor?.CorCode ||
      "",
    corridorId: office.fkCorId,
  };
}