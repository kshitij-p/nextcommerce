import { type NextPage } from "next";
import Head from "next/head";

const getErrorMsg = (code?: number) => {
  switch (code) {
    case 404:
      return "Page not found";

    case 400:
      return "Bad request";

    case 500:
      return "Something went wrong";

    default:
      return "Something went wrong";
  }
};

const ErrorPage: NextPage<{
  statusCode?: number;
  message?: string;
}> = ({ statusCode, message }) => {
  return (
    <>
      <Head>
        <title>{`${
          statusCode ?? "Something went wrong"
        } | Nextcommerce`}</title>
      </Head>
      <div className="pointer-events-none absolute inset-0 flex h-screen w-full items-center justify-center">
        <div className="flex max-w-max items-center gap-2 text-lg tracking-wider md:gap-4 md:text-4xl">
          {statusCode ? (
            <span className="border-r-2 px-2 md:px-4">{statusCode}</span>
          ) : null}
          <p className="">{message ? message : getErrorMsg(statusCode)}</p>
        </div>
      </div>
    </>
  );
};

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
