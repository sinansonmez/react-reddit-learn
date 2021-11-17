import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {usePostsQuery} from "../generated/graphql";
import Layout from "../components/Layout";

const Index = () => {
  const [response] = usePostsQuery()
  return (
    <Layout>
      {!response.data ? (
        <div>loading...</div>
      ) : (
        response.data.posts.map((p) => <div key={p.id}>{p.title}</div>)
      )}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index)
