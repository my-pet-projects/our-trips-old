import { Itinerary, ItineraryPlace } from "@/server/api/routers/itinerary";
import fs from "fs";
import PDFDocument from "pdfkit";

export class ItineraryPdfGenerator {
  private regularFontName = "Regular";
  private boldFontName = "Bold";
  private doc = new PDFDocument();

  constructor() {
    this.doc.registerFont(this.boldFontName, "public/fonts/noto-sans-bold.ttf");
    this.doc.registerFont(
      this.regularFontName,
      "public/fonts/noto-sans-regular.ttf"
    );
    this.doc.fontSize(10);
    this.doc.font(this.regularFontName);
  }

  private renderItineraryOverview(
    itinerary: Itinerary,
    overviewMap: ArrayBuffer
  ) {
    this.doc.font(this.boldFontName).fontSize(20).text(itinerary.name);
    this.doc.image(overviewMap, {
      height: 300,
      align: "center",
      valign: "center",
    });
    // add places list
  }

  private renderPlace(place: ItineraryPlace, placeMap?: ArrayBuffer) {
    this.doc
      .font(this.boldFontName)
      .fontSize(15)
      .text(`${place.order} ${place.attraction.name}`);
    this.doc.fontSize(10).text(place.attraction.nameLocal || "");

    const imgHeight = 200;
    if (
      imgHeight +
        this.doc.y +
        this.doc.currentLineHeight(true) +
        this.doc.page.margins.top +
        this.doc.page.margins.bottom >
      this.doc.page.maxY()
    ) {
      this.doc.addPage();
    }

    if (placeMap) {
      this.doc.image(placeMap, {
        height: imgHeight,
        align: "center",
        valign: "center",
      });
    }

    this.doc
      .fontSize(10)
      .font(this.regularFontName)
      .text(place.attraction.description || "", { align: "justify" });
    this.doc.moveDown();
  }

  public generate(
    itinerary: Itinerary,
    overviewMap: ArrayBuffer,
    placesMaps: Map<string, ArrayBuffer>
  ) {
    const name = `${itinerary.name}.pdf`;
    const ws = fs.createWriteStream(name);
    this.doc.pipe(ws);

    this.renderItineraryOverview(itinerary, overviewMap);
    itinerary.places.forEach((place) => {
      const placeMap = placesMaps.get(place.id);
      this.renderPlace(place, placeMap);
    });

    this.doc.end();
  }
}
