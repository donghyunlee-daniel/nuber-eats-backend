# Nuber Eats

The Backend of Nuber Eats Clone

## Develop Diary (Error notes, thoughts and what I have learned)
https://docs.google.com/document/d/1OKuxbB5rHXZ_7k0b1ziKvdQxIGjcXaYHMV-59-zcE30/edit?usp=sharing

 ## Use
- GraphQL with Apollo Server
- TypeORM
- TypeScript 
- PostgreSQL
- TypeORM
- bcript (Hash)
- JWT (Authentication)
- Guard
- Joi (Validation)
- GraphQL-WS (Web Socket)


## User Entity:
- id
- createdAt
- updatedAt

- email
- password
- role (client|owne|driver)

## User CRUD:
- Create Account
- Log In
- See profile
- Edit profile
- Verify Email

## Restaurant Model
- name
- category
- address
- coverImage

## Restaurant CRUD
- create Restaurant
- Edit Restaurant
- Delete Restaurant
- Search Restaurant
- See Restaurant with pagination
- See Restaurant by Category
- See Categories

## Dish
- Create Dish
- Edit Dish
- Delete Dish

## Order
- Orders CRUD
- Orders Subscription (Owner, Delivery, Client)
 - Pending Orders (Owner) (subscribing: newOrder)(trigger: createOrder(newOrder))
 - Pending Pickup Order (Delivery) (subscribing: orderUpdate) (trigger: editOrder(orderUpdate))
 - Order Status (Client) (subscribing: orderUpdate) (trigger: editOrder(orderUpdate))

