/* const useEditCartQuantity = () => {
  const { mutateAsync: updateQuantity, isLoading: isUpdatingQty } =
    api.cart.updateQuantity.useMutation({
      onMutate: cancelCartItemQuery,
      onSettled: invalidateCartItemQuery,
      onSuccess: () => {
        //To do throw a toast here
        console.log("updated product quantity");
      },
    });
};
 */
