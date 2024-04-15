export type BookModel = {
    accessinfo: AccessInfoModel,
    etag: string,
    id: string,
    kind: string,
    selfLink: string,
    saleInfo: SaleInfoModel,
    searchInfo: SearchInfoModel,
    volumeInfo: VolumeInfoModel,
}

type AccessInfoModel = {
    accessViewStatus: string,
    country: string,
    embeddable: boolean,
    epub: {isAvailable: boolean},
    pdf: {isAvailable: boolean},
    publicDomain: boolean,
    quoteSharingAllowed: boolean,
    textToSpeechPermission: string,
    viewability: string,
    webReaderLink: string,
}

type SaleInfoModel = {
    buyLink: string,
    country: string,
    isEbook: boolean,
    listPrice: PriceModel,
    offers: OffersModel[],
    retailPrice: PriceModel,
    saleability: string,
}

type PriceModel = {
    amount?: number,
    amountInMicros?: number,
    currencyCode: string,
}

type OffersModel = {
    finskyOfferType: number,
    listPrice: PriceModel,
    retailPrice: PriceModel,
}

type SearchInfoModel = {
    textSnippet: string,
}

type VolumeInfoModel = {
    allowAnonLogging: boolean,
    authors: string[],
    canonicalVolumeLink: string,
    categories: string[],
    contentVersion: string,
    description: string,
    imageLinks?: ImageLinksModel,
    industryIdentifiers: IndustryIdentifierModel[],
    infoLink: string,
    language: string,
    maturityRating: string,
    pageCount: number,
    panelizationSummary: PanelizationSummaryModel,
    previewLink: string,
    printType: string,
    publishedDate: string,
    publisher: string,
    readingModes: ReadingModesModel,
    subtitle: string,
    title: string,
}

type ImageLinksModel = {
    smallThumbnail: string,
    thumbnail: string,
}

type IndustryIdentifierModel = {
    type: string,
    identifier: string,
}

type PanelizationSummaryModel = {
    containesEpubBubbles: boolean,
    containesImageBubbles: boolean,
}

type ReadingModesModel = {
    text: boolean, 
    image: boolean,
}