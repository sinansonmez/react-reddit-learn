import {useMeQuery} from "../generated/graphql";
import {useRouter} from "next/router";
import {useEffect} from "react";

export const useIsAuth = () => {
  const [response] = useMeQuery();
  const router = useRouter()
  console.log(router)
  useEffect(() => {
    if (!response.fetching && !response.data?.me) {
      router.replace(`/login?next=${router.pathname}`);
    }
  }, [response.fetching, response.data, router]);
}