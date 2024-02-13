import withAuth from "@/src/hocs/withAuth";
import axios from "axios";
import { GetServerSideProps } from "next";
import Link from 'next/link';
import * as Api from '../../utils/api'

// ------ Payment 객체 ------
// @docs https://docs.tosspayments.com/reference#payment-객체
interface Payment {
  orderName: string;
  approvedAt: string;
  receipt: {
    url: string;
  };
  totalAmount: number;
  method: "카드" | "가상계좌" | "계좌이체";
  paymentKey: string;
  orderId: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const {
    query: { paymentKey, orderId, amount },
  } = context;
  const cookie = context.req.headers.cookie || '';
  console.log(context.query)

  try {
    // ------  결제 승인 ------
    // @docs https://docs.tosspayments.com/guides/payment-widget/integration#3-결제-승인하기
    const { data: payment } = await Api.post<Payment>(
        'http://localhost:5001/api/purchase/success',
        {
          paymentKey,
          orderId,
          amount,
        },
        cookie
      );

    return {
      props: { payment },
    };

    // const { data: payment } = await axios.post<Payment>(
    //   'http://localhost:5001/api/purchase/success',
    //   {
    //     paymentKey,
    //     orderId,
    //     amount,
    //   },
    // );
    // console.log(payment)
    // return {
    //   props: { payment },
    // };
  } catch (err: any) {
    console.error("err", err.response.data);

    return {
      redirect: {
        destination: `/payment/fail?code=${err.response.data.code}&message=${encodeURIComponent(err.response.data.message)}`,
        permanent: false,
      },
    };
  }
};

interface Props {
  payment: Payment;
}

  function SuccessPage({ payment }: Props) {
  return (
    <main>
      <div className="result wrapper">
        <div className="box_section">  
          <h2 style={{padding: "20px 0px 10px 0px"}}>
              <img
                width="35px"
                src="https://static.toss.im/3d-emojis/u1F389_apng.png"
              />
              결제 성공
          </h2>
          <p>구매해주셔서 감사합니다.</p>
          <br/><br/>
          <Link href={'/chat'}>
            <button className="button">구루에게 질문하기</button>
          </Link>
          
          {/* <p>paymentKey = {payment.paymentKey}</p>
          <p>orderId =  {payment.orderId}</p> */}
          {/* <p>amount = {payment.totalAmount.toLocaleString()}원</p> */}

          <div>
            <Link href="https://docs.tosspayments.com/guides/payment-widget/integration">
              <button className="button" style={{ marginTop: '30px', marginRight: '10px' }}>연동 문서</button>
            </Link>
            <Link href="https://discord.gg/A4fRFXQhRu">
              <button className="button" style={{ marginTop: '30px', backgroundColor: '#e8f3ff', color: '#1b64da' }}>실시간 문의</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(SuccessPage)