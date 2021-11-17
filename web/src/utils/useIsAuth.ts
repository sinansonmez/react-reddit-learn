import {useMeQuery} from "../generated/graphql";
import {useRouter} from "next/router";
import {useEffect} from "react";

export const useIsAuth = () => {
  const [response] = useMeQuery();
  const router = useRouter()
  useEffect(() => {
    if (!response.fetching && !response.data?.me) {
      router.replace('/login');
    }
  }, [response.fetching, response.data, router]);
}