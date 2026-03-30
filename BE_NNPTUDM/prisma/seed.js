require("dotenv").config();
require("module-alias/register");

const fs = require("fs");
const path = require("path");
const prisma = require("../src/libs/prisma");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

// map brand folder -> product folder -> product name trong DB
const PRODUCT_IMAGE_MAP = {
  Dior: {
    DiorSauvage: "Dior Sauvage",
    MissDior: "Miss Dior",
    Jadore: "J'adore",
    HypnoticPoison: "Hypnotic Poison",
    Poison: "Poison",
  },
  Chanel: {
    ChanelNo5: "Chanel No.5",
    BleuDeChanel: "Bleu de Chanel",
    CocoMademoiselle: "Coco Mademoiselle",
    ChanelChance: "Chanel Chance",
    AllureHommeSport: "Allure Homme Sport",
  },
  Gucci: {
    GucciBloom: "Gucci Bloom",
    GucciGuilty: "Gucci Guilty",
    GucciRush: "Gucci Rush",
    GucciFlora: "Gucci Flora",
    GucciPourHommeII: "Gucci Pour Homme II",
  },
  YSL: {
    BlackOpium: "Black Opium",
    LaNuitdeLHomme: "La Nuit de L'Homme",
    Libre: "Libre",
    MonParis: "Mon Paris",
    Opium: "Opium",
  },
  GiorgioArmani: {
    AcquadiGio: "Acqua di Giò",
    ArmaniSi: "Armani Si",
    ArmaniCode: "Armani Code",
    MyWay: "My Way",
    AcquadiGioia: "Acqua di Gioia",
  },
  Versace: {
    VersaceEros: "Versace Eros",
    BrightCrystal: "Bright Crystal",
    DylanBlue: "Dylan Blue",
    CrystalNoir: "Crystal Noir",
    VersacePourHomme: "Versace Pour Homme",
  },
  PacoRabanne: {
    "1Million": "1 Million",
    LadyMillion: "Lady Million",
    Invictus: "Invictus",
    Olympea: "Olympéa",
    Phantom: "Phantom",
  },
  CalvinKlein: {
    CKOne: "CK One",
    Euphoria: "Euphoria",
    Obsession: "Obsession",
    CKBe: "CK Be",
    Eternity: "Eternity",
  },
};

function isImageFile(fileName) {
  return /\.(png|jpg|jpeg|webp)$/i.test(fileName);
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const productNameToIdMap = {};
  for (const product of products) {
    productNameToIdMap[product.name] = product.id;
  }

  const productImages = [];

  for (const brandFolder of Object.keys(PRODUCT_IMAGE_MAP)) {
    const brandPath = path.join(PUBLIC_DIR, brandFolder);

    if (!fs.existsSync(brandPath)) {
      console.log(`Không tìm thấy folder brand: ${brandFolder}`);
      continue;
    }

    const productFoldersMap = PRODUCT_IMAGE_MAP[brandFolder];

    for (const productFolder of Object.keys(productFoldersMap)) {
      const productName = productFoldersMap[productFolder];
      const productId = productNameToIdMap[productName];

      if (!productId) {
        console.log(`Không tìm thấy product trong DB: ${productName}`);
        continue;
      }

      const productFolderPath = path.join(brandPath, productFolder);

      if (!fs.existsSync(productFolderPath)) {
        console.log(`Không tìm thấy folder product: ${brandFolder}/${productFolder}`);
        continue;
      }

      const imageFiles = fs
        .readdirSync(productFolderPath)
        .filter(isImageFile)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (!imageFiles.length) {
        console.log(`Không có ảnh trong folder: ${brandFolder}/${productFolder}`);
        continue;
      }

      imageFiles.forEach((fileName, index) => {
        productImages.push({
          productId: BigInt(productId),
          url: `/${brandFolder}/${productFolder}/${fileName}`,
          isMain: index === 0,
          createdAt: new Date(),
        });
      });
    }
  }

  await prisma.productImage.createMany({
    data: productImages,
  });

  console.log(`Seed productImage success: ${productImages.length} images`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
  });

// require("dotenv").config();
// require("module-alias/register");

// const prisma = require("../src/libs/prisma");

// function randomQuantity() {
//   return Math.floor(Math.random() * 11) + 10; // 10 -> 20
// }

// function randomBasePrice() {
//   return Math.floor(Math.random() * 251 + 200) * 1000;
//   // 200000 -> 450000
// }

// async function main() {
//   const products = await prisma.product.findMany({
//     select: {
//       id: true,
//       name: true,
//     },
//     orderBy: {
//       id: "asc",
//     },
//   });

//   const variants = [];

//   for (const product of products) {
//     const basePrice = randomBasePrice();

//     variants.push(
//       {
//         productId: BigInt(product.id),
//         capacity: 30,
//         price: basePrice,
//         quantity: randomQuantity(),
//       },
//       {
//         productId: BigInt(product.id),
//         capacity: 50,
//         price: basePrice + 120000,
//         quantity: randomQuantity(),
//       },
//       {
//         productId: BigInt(product.id),
//         capacity: 100,
//         price: basePrice + 300000,
//         quantity: randomQuantity(),
//       }
//     );
//   }

//   await prisma.productVariant.createMany({
//     data: variants,
//   });

//   console.log(`Seed productVariant success: ${variants.length} variants`);
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch(async (e) => {
//     console.log(e);
//     await prisma.$disconnect();
//   });

// require("dotenv").config();
// require("module-alias/register");

// const prisma = require("../src/libs/prisma");

// async function main() {
//   const products = [
//     // 1. Dior
//     {
//       name: "Dior Sauvage",
//       description:
//         "Mùi hương nam tính nổi tiếng của Dior với sự kết hợp giữa cam bergamot tươi mát và tiêu cay nhẹ. Lớp hương gỗ và ambroxan tạo cảm giác mạnh mẽ, hiện đại và rất phù hợp sử dụng hằng ngày.",
//       production: 2015,
//       brandId: BigInt(1),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Miss Dior",
//       description:
//         "Miss Dior mang phong cách nữ tính và thanh lịch. Hương hoa hồng và hoa nhài hòa quyện với cam bergamot tạo nên mùi hương tươi mới, lãng mạn.",
//       production: 1947,
//       brandId: BigInt(1),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "J'adore",
//       description:
//         "J'adore là dòng nước hoa cao cấp nổi tiếng của Dior. Sự kết hợp nhiều loài hoa mang lại mùi hương sang trọng, nhẹ nhàng và rất quyến rũ.",
//       production: 1999,
//       brandId: BigInt(1),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Hypnotic Poison",
//       description:
//         "Hypnotic Poison có mùi hương ngọt ấm và bí ẩn. Hạnh nhân và vani tạo cảm giác quyến rũ, thích hợp cho buổi tối hoặc các dịp đặc biệt.",
//       production: 1998,
//       brandId: BigInt(1),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Poison",
//       description:
//         "Poison là dòng nước hoa cổ điển với mùi hương mạnh mẽ và cá tính. Hương hoa và gia vị tạo nên sự bí ẩn và quyến rũ.",
//       production: 1985,
//       brandId: BigInt(1),
//       categoryId: 2,
//       createdAt: new Date(),
//     },

//     // 2. Chanel
//     {
//       name: "Chanel No.5",
//       description:
//         "Chanel No.5 là một trong những loại nước hoa nổi tiếng nhất thế giới. Mùi hương hoa cổ điển mang lại cảm giác sang trọng và thanh lịch.",
//       production: 1921,
//       brandId: BigInt(3),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Bleu de Chanel",
//       description:
//         "Bleu de Chanel mang phong cách nam tính hiện đại. Hương chanh tươi mát kết hợp với gỗ tạo nên sự mạnh mẽ và tinh tế.",
//       production: 2010,
//       brandId: BigInt(3),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Coco Mademoiselle",
//       description:
//         "Coco Mademoiselle mang phong cách trẻ trung và sang trọng. Hương cam tươi kết hợp hoa hồng tạo nên mùi hương quyến rũ.",
//       production: 2001,
//       brandId: BigInt(3),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Chanel Chance",
//       description:
//         "Chanel Chance có mùi hương nhẹ nhàng, nữ tính và rất dễ sử dụng hằng ngày.",
//       production: 2003,
//       brandId: BigInt(3),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Allure Homme Sport",
//       description:
//         "Allure Homme Sport mang phong cách thể thao và năng động. Hương cam tươi mát kết hợp xạ hương tạo cảm giác sảng khoái.",
//       production: 2004,
//       brandId: BigInt(3),
//       categoryId: 1,
//       createdAt: new Date(),
//     },

//     // 3. Gucci
//     {
//       name: "Gucci Bloom",
//       description:
//         "Gucci Bloom tái hiện mùi hương của khu vườn hoa tự nhiên. Mang cảm giác mềm mại, nữ tính và tươi mới.",
//       production: 2017,
//       brandId: BigInt(8),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Gucci Guilty",
//       description:
//         "Gucci Guilty mang phong cách nam tính hiện đại với hương cam tươi và oải hương.",
//       production: 2011,
//       brandId: BigInt(8),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Gucci Rush",
//       description:
//         "Gucci Rush có mùi hương ngọt và quyến rũ. Thiết kế chai đỏ đặc trưng rất nổi bật.",
//       production: 1999,
//       brandId: BigInt(8),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Gucci Flora",
//       description:
//         "Gucci Flora mang mùi hương nhẹ nhàng và thanh lịch, phù hợp với phụ nữ trẻ.",
//       production: 2009,
//       brandId: BigInt(8),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Gucci Pour Homme II",
//       description:
//         "Dòng nước hoa nam với hương trà và quế tạo cảm giác ấm áp và sang trọng.",
//       production: 2007,
//       brandId: BigInt(8),
//       categoryId: 1,
//       createdAt: new Date(),
//     },

//     // 4. YSL
//     {
//       name: "Black Opium",
//       description:
//         "Black Opium nổi bật với mùi hương cà phê đặc trưng kết hợp vani ngọt ngào tạo sự quyến rũ.",
//       production: 2014,
//       brandId: BigInt(6),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "La Nuit de L'Homme",
//       description:
//         "La Nuit de L'Homme mang phong cách nam tính và bí ẩn, thích hợp cho buổi tối.",
//       production: 2009,
//       brandId: BigInt(6),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Libre",
//       description:
//         "Libre thể hiện sự tự do và mạnh mẽ của phụ nữ hiện đại với mùi hương vừa mềm mại vừa cá tính.",
//       production: 2019,
//       brandId: BigInt(6),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Mon Paris",
//       description:
//         "Mon Paris mang phong cách lãng mạn với mùi hương ngọt nhẹ và nữ tính.",
//       production: 2016,
//       brandId: BigInt(6),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Opium",
//       description:
//         "Opium là dòng nước hoa cổ điển nổi tiếng với mùi hương ấm áp và quyến rũ.",
//       production: 1977,
//       brandId: BigInt(6),
//       categoryId: 2,
//       createdAt: new Date(),
//     },

//     // 5. Giorgio Armani
//     {
//       name: "Acqua di Giò",
//       description:
//         "Lấy cảm hứng từ biển cả với mùi hương tươi mát và sảng khoái.",
//       production: 1996,
//       brandId: BigInt(4),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Armani Si",
//       description:
//         "Armani Si dành cho phụ nữ hiện đại với mùi hương ngọt dịu và thanh lịch.",
//       production: 2013,
//       brandId: BigInt(4),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Armani Code",
//       description:
//         "Armani Code mang phong cách bí ẩn và sang trọng dành cho nam.",
//       production: 2004,
//       brandId: BigInt(4),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "My Way",
//       description:
//         "My Way có mùi hương hiện đại, tươi mới và nữ tính.",
//       production: 2020,
//       brandId: BigInt(4),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Acqua di Gioia",
//       description:
//         "Mang cảm hứng từ thiên nhiên với mùi hương tươi mát và nhẹ nhàng.",
//       production: 2010,
//       brandId: BigInt(4),
//       categoryId: 2,
//       createdAt: new Date(),
//     },

//     // 6. Versace
//     {
//       name: "Versace Eros",
//       description:
//         "Versace Eros mang phong cách nam tính mạnh mẽ với hương bạc hà tươi mát và vani ấm áp.",
//       production: 2012,
//       brandId: BigInt(5),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Bright Crystal",
//       description:
//         "Bright Crystal có mùi hương nhẹ nhàng, nữ tính và rất thanh lịch.",
//       production: 2006,
//       brandId: BigInt(5),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Dylan Blue",
//       description:
//         "Dylan Blue là dòng nước hoa nam hiện đại với mùi hương mạnh mẽ và nam tính.",
//       production: 2016,
//       brandId: BigInt(5),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Crystal Noir",
//       description:
//         "Crystal Noir mang mùi hương bí ẩn, ấm áp và quyến rũ.",
//       production: 2004,
//       brandId: BigInt(5),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Versace Pour Homme",
//       description:
//         "Versace Pour Homme có mùi hương tươi mát, thanh lịch và dễ sử dụng.",
//       production: 2008,
//       brandId: BigInt(5),
//       categoryId: 1,
//       createdAt: new Date(),
//     },

//     // 7. Paco Rabanne
//     {
//       name: "1 Million",
//       description:
//         "1 Million mang phong cách nam tính nổi bật với hương quế, da thuộc và hổ phách, tạo cảm giác sang trọng và cuốn hút.",
//       production: 2008,
//       brandId: BigInt(7),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Lady Million",
//       description:
//         "Lady Million có mùi hương nữ tính, ngọt ngào và quyến rũ với sự hòa quyện của hoa nhài, mật ong và hoắc hương.",
//       production: 2010,
//       brandId: BigInt(7),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Invictus",
//       description:
//         "Invictus mang mùi hương tươi mát, mạnh mẽ và đầy năng lượng với cảm hứng từ biển cả và gỗ guaiac.",
//       production: 2013,
//       brandId: BigInt(7),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "Olympéa",
//       description:
//         "Olympéa là mùi hương nữ quyến rũ với vanilla, muối biển và hoa nhài, tạo cảm giác vừa mềm mại vừa nổi bật.",
//       production: 2015,
//       brandId: BigInt(7),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Phantom",
//       description:
//         "Phantom mang phong cách hiện đại, nam tính với hương chanh, oải hương và vani, phù hợp sử dụng hằng ngày.",
//       production: 2021,
//       brandId: BigInt(7),
//       categoryId: 1,
//       createdAt: new Date(),
//     },

//     // 8. Calvin Klein
//     {
//       name: "CK One",
//       description:
//         "CK One là mùi hương unisex tươi mát, trẻ trung với sự kết hợp của chanh, trà xanh và xạ hương, rất dễ dùng hằng ngày.",
//       production: 1994,
//       brandId: BigInt(2),
//       categoryId: 3,
//       createdAt: new Date(),
//     },
//     {
//       name: "Euphoria",
//       description:
//         "Euphoria mang phong cách nữ tính, quyến rũ với hương lựu, hoa lan và hoắc hương, tạo cảm giác bí ẩn và cuốn hút.",
//       production: 2005,
//       brandId: BigInt(2),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//     {
//       name: "Obsession",
//       description:
//         "Obsession là mùi hương đậm ấm với quế, vani và hổ phách, mang lại cảm giác mạnh mẽ và đầy lôi cuốn.",
//       production: 1985,
//       brandId: BigInt(2),
//       categoryId: 1,
//       createdAt: new Date(),
//     },
//     {
//       name: "CK Be",
//       description:
//         "CK Be là dòng nước hoa unisex nhẹ nhàng với bạc hà, oải hương và gỗ, tạo cảm giác sạch sẽ, gần gũi và hiện đại.",
//       production: 1996,
//       brandId: BigInt(2),
//       categoryId: 3,
//       createdAt: new Date(),
//     },
//     {
//       name: "Eternity",
//       description:
//         "Eternity mang phong cách thanh lịch và cổ điển với hoa nhài, hoa huệ và gỗ đàn hương, phù hợp với người yêu sự tinh tế.",
//       production: 1988,
//       brandId: BigInt(2),
//       categoryId: 2,
//       createdAt: new Date(),
//     },
//   ];

//   await prisma.product.createMany({
//     data: products,
//   });

//   console.log(`Seed product success: ${products.length} products`);
// }

// main()
//   .then(() => prisma.$disconnect())
//   .catch(async (e) => {
//     console.log(e);
//     await prisma.$disconnect();
//   });