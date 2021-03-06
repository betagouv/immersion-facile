import { useDispatch } from "react-redux";
import { routes, useRoute } from "src/app/routing/routes";
import { authSlice } from "src/core-logic/domain/auth/auth.slice";

export const useRedirectToConventionWithoutIdentityProvider = () => {
  const dispatch = useDispatch();
  const route = useRoute();

  return () => {
    dispatch(authSlice.actions.federatedIdentityProvided("noIdentityProvider"));
    if (route.name !== routes.convention.name) routes.convention().push();
  };
};
