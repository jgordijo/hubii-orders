# Orders microsservice - Hubii

## 📌 Project Description
- This project is a simple backend service for orders management, features:
- Get single order
- Get order list
- Get customer list
- Create an order
- Get Shipping Rate
- API documentation available at `/docs`

## 🤔 Considerations
- After starting the orders microservice, I realized that storing prices as cents (INT) would have been a better approach to avoid floating-point issues and improve consistency.
- Given the deadline and project scope, I'll keep it as Decimal, but this is something I would approach differently in a future iteration.
- Due to the same constraints, I opted not to implement API key validation.
- Ideally, each product could be in a different warehouse/be shipped from a different location. To keep it simple, the same zip code is being used, coming from the env var `WAREHOUSE_ZIPCODE`.
- All shipping info considers only one package with fixed dimensions.
- For a real project, I sould probably add some async communication with the product API via events to update the order status.

## 🚀 Requirements

- Node.js v22
- Docker + Docker Compose
- Prisma CLI (`npx prisma`)
- `.env` file (see `.env.example` for reference)
- Melhor Envio API -> use the following vars: 
- `MELHOR_ENVIO_ACCESS_TOKEN=` get an API_TOKEN via https://sandbox.melhorenvio.com.br/

## 📦 Setup Instructions

- Install Node.js.
- If you already have `nvm` installed, just run `nvm use` to use the correct version.
- Clone the project.
- Install project dependencies running `npm install`.
- Add environment variables - `cp .env.example .env`
- Run `docker compose up -d`.
- Run `npx prisma migrate dev` to run the database migrations and seed the DB with sample customers, since there's no endpoint for creating customers.
- Optionally, if you also want to populate with some example orders (with IDs that does not exists on products API) you can uncomment the code on `seed.ts` and run `npx prisma db seed`.
- Start the service running `npm run start`. The service will run on port 3333 by default.
- You can also run the server using `npm run dev`. Running that way will watch changes and automatically restart the server.
- You can run `npx prisma studio` to see the database records directly through your browser at `http://localhost:5555`

## 📖 API Usage
- Example for creating a order
```bash
curl --request POST \
  --url http://localhost:3334/orders \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/10.3.1' \
  --data '{
	"customerId": "5732118c-09f4-4045-a8f6-ce558537fe6b",
	"shippingMethod": "sedex",
	"items": [
		{
			"productId": "3b43a917-3f15-46d3-83d7-6ac2d9c11250",
			"quantity": 1
		},
		{
			"productId": "4b756380-8d67-4e9d-981d-ac0d439960a7",
			"quantity": 1
		}
	]
}'
```
- To get a valid `customerId` you can call `http://localhost:3334//customers`.
- To get valid `productId` and available `quantity`, you must call the [Products API](https://github.com/jgordijo/hubii-products)

- Expected response:
```
{
	"order": {
		"id": "e45ff9f5-bdff-4157-a496-a13e047306d3",
		"customerId": "5732118c-09f4-4045-a8f6-ce558537fe6b",
		"total": "467.93",
		"shippingPrice": "12.95",
		"status": "CONFIRMED",
		"createdAt": "2025-03-06T20:57:46.558Z",
		"updatedAt": "2025-03-06T20:57:46.610Z"
	}
}
```
- For full documentation, visit: http://localhost:3334/docs
- An exported Insomnia collection (`http-requests.json`) is available in the project root. It can also be imported into Postman or other HTTP clients.

## 🧪 Running Tests
- This project has 100% test coverage using Jest, including unit and integration tests.
- The test suite can be run by `npm test` or `npm run test`.
 
![image](https://github.com/user-attachments/assets/46986b2c-0580-4550-9ad2-d0050378c4c8)


## 📁 File Tree Structure

```bash
└── 📁hubii-orders
    └── 📁__tests__
        └── 📁customers
            └── 📁repositories
                └── customers-repository.spec.ts
            └── 📁routes
                └── get-customer-shipping-route.spec.ts
                └── get-customers-route.spec.ts
            └── 📁useCases
                └── get-customer-shipping.spec.ts
                └── get-customers.spec.ts
        └── hello-world-route.spec.ts
        └── 📁mocks
            └── setupTestServer.ts
            └── testEnvs.ts
        └── 📁orders
            └── 📁repositories
                └── orders-repository.spec.ts
            └── 📁routes
                └── create-order-route.spec.ts
                └── get-order-route.spec.ts
                └── get-orders-route.spec.ts
            └── 📁useCases
                └── create-order.spec.ts
                └── get-order.spec.ts
                └── get-orders.spec.ts
        └── 📁utils
            └── calculate-items-price.spec.ts
            └── calculate-shipping.spec.ts
            └── melhor-envio-client.spec.ts
            └── procucts-client.spec.ts
    └── 📁.vscode
        └── settings.json
    └── 📁prisma
        └── 📁migrations
            └── 📁20250228172700_add_customers_orders_and_order_items_tables
                └── migration.sql
            └── migration_lock.toml
        └── schema.prisma
        └── seed.ts
    └── 📁src
        └── app.ts
        └── env.ts
        └── 📁infra
            └── 📁prisma
                └── client.ts
            └── 📁repositories
                └── customers-repository.ts
                └── orders-repository.ts
        └── 📁routes
            └── 📁customers
                └── get-customer-shipping-route.ts
                └── get-customers-route.ts
                └── index.ts
            └── hello-world-route.ts
            └── 📁orders
                └── create-order-route.ts
                └── get-order-route.ts
                └── get-orders-route.ts
                └── index.ts
        └── server.ts
        └── 📁types
            └── customers-types.ts
            └── order-types.ts
            └── products-type.ts
            └── shipping-types.ts
        └── 📁useCases
            └── 📁customers
                └── calculate-customer-shipping.ts
                └── get-customers.ts
            └── 📁orders
                └── create-order.ts
                └── get-order.ts
                └── get-orders.ts
        └── 📁utils
            └── cache.ts
            └── calculate-items-price.ts
            └── calculate-shipping.ts
            └── melhor-envio-client.ts
            └── products-client.ts
    └── .env
    └── .env.example
    └── .gitignore
    └── .nvmrc
    └── biome.json
    └── docker-compose.yml
    └── http-requests.json
    └── jest.config.js
    └── package-lock.json
    └── package.json
    └── README.md
    └── tsconfig.json
    └── tsup.config.ts
```
