import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//to do: use chatgpt to generate descriptions for images
const getFeaturedProducts = (
  adminUserId: string
): Array<Parameters<typeof prisma.product.create>[0]["data"]> => [
  {
    userId: adminUserId,
    title: "Short Sleeved Black T-Shirt ",
    description:
      "A black round neck t-shirt is a classic and versatile wardrobe staple that can be dressed up or down for any occasion. Made from soft and comfortable cotton or a blend of cotton and other materials, it is designed to provide a comfortable and relaxed fit that flatters any body shape. The black color provides a sleek and modern look that can be dressed up or down depending on the occasion.Whether you're wearing it to church, out with friends, or just lounging around at home, this Yahweh Yireh t-shirt is sure to become a favorite in your wardrobe. Order yours today and let the world know that you trust in God's provision. The sleeves are usually short, making it perfect for warmer weather or for layering under jackets or sweaters in cooler temperatures. The length of the t-shirt can vary from cropped to hip-length, depending on the style and personal preference. The simplicity and versatility of a black round neck t-shirt make it a great option for a variety of occasions. It can be paired with jeans and sneakers for a casual look, or dressed up with trousers and heels for a more formal occasion.",
    price: 40,
    images: {
      create: [
        {
          key: "/images/featured-products/1.webp",
          publicUrl: "/images/featured-products/1.webp",
        },
      ],
    },
    featured: true,
    category: "Clothing_and_Accessories",
  },
  {
    userId: adminUserId,
    title: "Tayson White T-Shirt",
    description:
      "Introducing the Tayson White T-Shirt with the powerful word \"Brotherhood\" emblazoned across the chest. Made with premium quality cotton, this t-shirt is soft, comfortable, and perfect for daily wear. The \"Brotherhood\" design on this t-shirt represents the bond between brothers, regardless of race, ethnicity, or background. It's a statement of unity, solidarity, and support for one another. This message is especially relevant today when we need to come together as a community and celebrate our differences. The classic fit of this t-shirt features a ribbed crew neck and short sleeves that offer a relaxed and comfortable fit. It's designed to be worn on its own  or as a layering piece with your favorite jacket or sweater. The white color adds a touch of sophistication and pairs well with any style. Whether you're running errands, hanging out with friends, or attending a family function, this Tayson t-shirt is versatile enough to be worn on any occasion. It's the perfect addition to your wardrobe and a statement of your commitment to brotherhood. Order yours today and show your support for the community!",
    price: 60,
    images: {
      create: [
        {
          key: "/images/featured-products/2.webp",
          publicUrl: "/images/featured-products/2.webp",
        },
      ],
    },
    featured: true,
    category: "Clothing_and_Accessories",
  },
  {
    userId: adminUserId,
    title: "Brown Unisex Leather Jacket",
    description:
      "This unisex brown leather jacket is a timeless piece that exudes style and sophistication. Crafted from high-quality leather, this jacket is durable and long-lasting, making it a perfect investment piece for your wardrobe.The jacket has a classic design with a slim-fit cut, featuring a front zipper closure, a band collar, and two side pockets. The smooth and soft texture of the leather adds a touch of luxury to this piece, making it ideal for dressing up or down. The rich brown color of the leather is versatile and can be paired with a variety of outfits. It pairs well with jeans and a t-shirt for a casual look or dressed up with dress pants and a button-up shirt for a more formal occasion. This unisex jacket is perfect for both men and women, offering a sleek and stylish look that's suitable for any occasion. It's a classic piece that will never go out of style and can be worn for years to come. Invest in this brown leather jacket today and add a touch of sophistication to your wardrobe. Its timeless design and high-quality craftsmanship make it a piece that you will cherish for years to come.",
    price: 100,
    images: {
      create: [
        {
          key: "/images/featured-products/3.webp",
          publicUrl: "/images/featured-products/3.webp",
        },
      ],
    },
    featured: true,
    category: "Clothing_and_Accessories",
  },
  {
    userId: adminUserId,
    title: "Fossil Classic Watch",
    description:
      "Introducing the timeless and classic watch from the renowned brand Fossil, now featuring a beautiful leather bracelet. This watch is the perfect combination of elegance and function, designed to complement any outfit and make a statement. The watch features a stainless steel case with a beautiful white dial adorned with black Roman numerals and hands. The leather bracelet adds a touch of sophistication to this piece while ensuring durability and comfort. This watch is not only stylish but also highly functional, with quartz movement and a water resistance of up to 50 meters. It also features a date display window, adding an extra layer of convenience to your daily routine. The leather bracelet of the watch is adjustable and has a buckle clasp, ensuring a comfortable and secure fit on your wrist. The Fossil logo on the dial and buckle is a testament to its superior quality and craftsmanship.",
    price: 100,
    images: {
      create: [
        {
          key: "/images/featured-products/4.webp",
          publicUrl: "/images/featured-products/4.webp",
        },
      ],
    },
    featured: true,
    category: "Clothing_and_Accessories",
  },
  {
    userId: adminUserId,
    title: "Nike Revolution 6",
    description:
      "The Nike Revolution 6 in red is the perfect combination of style, comfort, and performance. These sneakers are designed to take your running game to the next level, while also making a bold fashion statement. The breathable mesh upper of the shoe allows for maximum airflow, keeping your feet cool and dry during even the most intense workouts. The red colorway is eye-catching and adds a pop of color to any outfit. The shoe features a cushioned midsole that provides excellent support and shock absorption, making it perfect for long runs or extended periods of wear. The outsole of the shoe is made of durable rubber that offers excellent traction, ensuring stability and security on any surface. The lace-up design of the sneaker ensures a secure fit, and the Nike logo on the side adds a touch of style and authenticity. The sneaker is lightweight and flexible, allowing for natural movement and making it easy to wear all day long.",
    price: 100,
    images: {
      create: [
        {
          key: "/images/featured-products/5.webp",
          publicUrl: "/images/featured-products/5.webp",
        },
      ],
    },
    featured: true,
    category: "Shoes_and_Footwear",
  },
  {
    userId: adminUserId,
    title: "Bold Red Jacket",
    description:
      "Introducing a stunning red high fashion jacket that exudes luxury and sophistication. This jacket is the epitome of style, crafted from high-quality materials and designed with the modern fashion-conscious individual in mind.The jacket features a bold and vibrant shade of red that commands attention and makes a statement. The silhouette is structured and tailored, offering a flattering and streamlined fit that accentuates your figure. The jacket is made of high-quality materials that provide durability and comfort, making it perfect for any occasion. The exterior is made of a soft and supple leather that gives a luxurious feel, while the interior is lined with smooth and silky fabric that feels gentle against the skin. The details of the jacket are what truly sets it apart. The sleek and modern design features a zippered front, fitted cuffs, and two side pockets. The collar is embellished with a bold and striking hardware that adds a touch of edge to the overall look.",
    price: 100,
    images: {
      create: [
        {
          key: "/images/featured-products/6.webp",
          publicUrl: "/images/featured-products/6.webp",
        },
      ],
    },
    featured: true,
    category: "Clothing_and_Accessories",
  },
  {
    userId: adminUserId,
    title: "Take Me Back To Eden Album - Sleep Token",
    description:
      '"Take Me Back To Eden" is a genre-bending album that showcases Sleep Token\'s immense musical range and talent. The album features standout tracks such as "Vore", a bone-crushing death metal song that seamlessly fuses heavy guitar riffs with haunting electronic sounds, "Granite", a hypnotic and soulful chill R&B track, and "The Summoning", a progressive metal song that takes listeners on a journey through unexpected twists and turns. The album\'s production is impeccable, with every element of the music crafted to perfection. The instrumentation is layered and complex, with each element of the music working together to create a cohesive and powerful whole. Overall, "Take Me Back To Eden" is a stunning and emotionally resonant album that showcases Sleep Token\'s incredible musicianship and their ability to create music that is both beautiful and cathartic. It\'s an album that is sure to leave a lasting impression on listeners and cement Sleep Token\'s place as one of the most innovative and exciting bands in modern music.',
    price: 150,
    images: {
      create: [
        {
          key: "/images/featured-products/7.webp",
          publicUrl: "/images/featured-products/7.webp",
        },
      ],
    },
    featured: true,
    category: "Music",
  },
  {
    userId: adminUserId,
    title: "Dune",
    description:
      "\"Dune,\" written by Frank Herbert, is a masterpiece of science fiction literature that has captured the imagination of readers for generations. Set in a distant future where humanity has spread across the galaxy and formed vast interstellar empires, the book tells the story of Paul Atreides, the young heir to the noble House Atreides. At the heart of the story is the desert planet Arrakis, also known as Dune, which is the only source of the spice melange, a highly prized substance that extends human life and grants psychic abilities. When Paul's family is betrayed and his father murdered, he must flee into the desert with his mother and a band of loyal followers, where they must navigate the harsh terrain and fight for survival against the brutal desert conditions and the fierce native population, the Fremen. Herbert's writing is rich and vivid, and the world of Dune is intricately detailed and fully realized. The book is a compelling mix of political intrigue, action, adventure, and philosophical musings, and Herbert's exploration of themes such as ecology, religion, and the nature of power make it a thought-provoking and intellectually stimulating read.",
    price: 40,
    images: {
      create: [
        {
          key: "/images/featured-products/8.webp",
          publicUrl: "/images/featured-products/8.webp",
        },
      ],
    },
    featured: true,
    category: "Books",
  },
  {
    userId: adminUserId,
    title: "Sony WH-1000MXH5 Wireless Headphones",
    description:
      "The Sony WH-1000XM5 wireless headphones are a premium audio accessory designed for those who demand the best in sound quality and noise cancellation. With advanced noise-cancelling technology and powerful audio drivers, these headphones deliver a crisp and immersive audio experience. The headphones feature Sony's industry-leading noise-cancelling technology, which uses multiple microphones to block out external noise and ensure that you can enjoy your music or calls without any distractions. They also have a quick attention mode, which allows you to quickly and easily pause your music and listen to ambient sound without taking off your headphones. The audio quality of the WH-1000XM5 is exceptional, thanks to their 40mm audio drivers and support for high-resolution audio formats. Whether you're listening to your favorite tracks or taking a phone call, you'll be able to hear every detail with crystal clarity. The headphones are also designed for comfort, with soft earpads that mold to the shape of your ears and a lightweight design that makes them easy to wear for extended periods. They have a long battery life of up to 30 hours, and can be charged quickly using the included USB-C cable.",
    price: 200,
    images: {
      create: [
        {
          key: "/images/featured-products/9.webp",
          publicUrl: "/images/featured-products/9.webp",
        },
      ],
    },
    featured: true,
    category: "Electronics",
  },
  {
    userId: adminUserId,
    title: "Cute Cat Airpods Holder",
    description:
      "The figurine of a cat holding wireless AirPods is a cute and compact collectible that is perfect for displaying on your desk or shelf. Measuring around 2x the size of the AirPods themselves, this petite figurine is a charming addition to any collection or space. Crafted from high-quality materials, such as resin or porcelain, the figurine is hand-painted with intricate details to bring the cat's personality to life. The tiny AirPods are also carefully crafted and designed to look like the real thing, adding to the overall appeal of the piece. Despite its small size, the figurine still manages to capture the essence of the playful and tech-savvy design. The adorable cat holding the AirPods is sure to bring a smile to anyone's face, making it a perfect gift for cat lovers and gadget enthusiasts alike. With its compact size, the figurine is easy to display on any flat surface, adding a touch of charm and whimsy to any room. Whether you're looking for a unique addition to your collection or a fun desk accessory, the figurine of a cat holding wireless AirPods is sure to impress.",
    price: 15,
    images: {
      create: [
        {
          key: "/images/featured-products/10.webp",
          publicUrl: "/images/featured-products/10.webp",
        },
      ],
    },
    featured: true,
    category: "Furniture",
  },
];

void (async function () {
  const adminEmail = process.env.ADMIN_USER_EMAIL;

  if (!adminEmail || typeof adminEmail !== "string") {
    throw new Error("Missing 'ADMIN_USER_EMAIL' env variable.");
  }

  const admin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!admin || !admin.id) {
    throw new Error("No user with the given email exists.");
  }

  const productsToAdd = getFeaturedProducts(admin.id);

  console.log(`Total products to add ${productsToAdd.length}`);

  let done = 0;

  for (let product of productsToAdd) {
    try {
      await prisma.product.create({
        data: product,
      });
      done++;
    } catch (e) {
      continue;
    }
  }

  console.log(`Added ${done}/${productsToAdd.length} products`);
})();

export {};
