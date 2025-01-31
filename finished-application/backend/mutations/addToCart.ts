import { KeystoneContext } from "@keystone-next/keystone/types";
import { KeystoneContext as ProjectKeystoneContext } from ".keystone/types";
import { CartItem } from ".prisma/client";
import { Session } from "../types";

async function addToCart(
  root: any,
  { productId }: { productId: string },
  _context: KeystoneContext
): Promise<CartItem> {
  const context = _context as ProjectKeystoneContext;
  console.log("ADDING TO CART!");
  // 1. Query the current user see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error("You must be logged in to do this!");
  }
  // 2. Query the current users cart
  const allCartItems = await context.db.CartItem.findMany({
    where: {
      user: { id: { equals: sesh.itemId } },
      product: { id: { equals: productId } },
    },
  });

  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(existingCartItem);
    console.log(
      `There are already ${existingCartItem.quantity}, increment by 1!`
    );
    // 3. See if the current item is in their cart
    // 4. if itis, increment by 1
    return context.db.CartItem.updateOne({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // 4. if it isnt, create a new cart item!
  return context.db.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  });
}

export default addToCart;
