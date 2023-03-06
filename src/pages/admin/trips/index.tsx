import { api } from "@/utils/api";
import Head from "next/head";

function Trips() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Trips history</title>
      </Head>
      <div>{JSON.stringify(hello)}</div>
    </>
  );
}

export default Trips;
