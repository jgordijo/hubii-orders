import { fakerPT_BR as faker } from '@faker-js/faker';
import { OrderStatus, Prisma, PrismaClient } from '@prisma/client';

const zipCodes = [
  '01000000',
  '20000000',
  '30100000',
  '40000000',
  '80000000',
  '90000000',
  '50000000',
  '60000000',
  '69000000',
  '66000000',
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const customers = await prisma.customers.createManyAndReturn({
    data: Array.from({ length: 10 }, (_, index) => ({
      name: faker.person.firstName(),
      email: faker.internet.email().toLowerCase(),
      zipCode: zipCodes[index % zipCodes.length],
    })),
  });

  /* Lines below can be uncommented to seed orders as well*/

  // await Promise.all(
  //   customers.map(customer =>
  //     prisma.orders.create({
  //       data: {
  //         customer: {
  //           connect: {
  //             id: customer.id,
  //           },
  //         },
  //         total: new Prisma.Decimal(faker.commerce.price()),
  //         shippingPrice: faker.commerce.price(),
  //         status: OrderStatus.DELIVERED,
  //         OrderItems: {
  //           createMany: {
  //             data: Array.from({ length: 3 }, () => ({
  //               price: new Prisma.Decimal(faker.commerce.price()),
  //               quantity: faker.number.int({ min: 1, max: 10 }),
  //               productId: faker.string.uuid(),
  //               productName: faker.commerce.productName(),
  //             })),
  //           },
  //         },
  //       },
  //     })
  //   )
  // );

  console.log('Seeding complete!');
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
