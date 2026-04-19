export const ORDER_ACTION: Record<string, string[]> = {
  placed: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready_for_rider"],
};     
//its a map of order status and the next possible status , or object with key as order status and value as array of next possible status