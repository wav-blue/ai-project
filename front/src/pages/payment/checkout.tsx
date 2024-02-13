import { useEffect, useRef, useState } from "react"
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk"
// import { ANONYMOUS } from "@tosspayments/payment-widget-sdk"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import { nanoid } from 'nanoid'
import { useQuery } from "@tanstack/react-query";
import withAuth from "@/src/hocs/withAuth";


// 실제 클라이언트 키
const clientKey = 'test_ck_AQ92ymxN3426QgPMdwNgrajRKXvd'
// 테스트용 클라이언트 키

// const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
// const TOSS_TEST_KEY = "test_sk_yZqmkKeP8g7m5ewmEE0B8bQRxB9l"

const CheckoutPage = () => {
  const userId = useSelector((state: RootState) => state.user.user.userId)
  const paymentInfo = useSelector((state: RootState) => state.payment.info)
  const [customerKey, setCustomerKey] = useState('YbX2HuSlsC9uVJW6NMRMj')
  console.log(customerKey)
  const { data: paymentWidget } = usePaymentWidget(clientKey, customerKey);
  // const { data: paymentWidget } = usePaymentWidget(clientKey, ANONYMOUS); // 비회원 결제
  const paymentMethodsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderPaymentMethods"]
  > | null>(null);
  const agreementsWidgetRef = useRef<ReturnType<
    PaymentWidgetInstance["renderAgreement"]
  > | null>(null);
  const [price, setPrice] = useState(6990);
  const [orderName, setOrderName] = useState('');

  useEffect(() => {
    setCustomerKey(userId)
    setPrice(paymentInfo.price)
    setOrderName(paymentInfo.membership)

    console.log(paymentInfo.price, paymentInfo.membership)

    if (paymentWidget == null) {
      return;
    }

    // ------  결제위젯 렌더링 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#renderpaymentmethods선택자-결제-금액-옵션
    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      "#payment-widget",
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentMethodsWidgetRef.current = paymentMethodsWidget;

    // ------  이용약관 렌더링 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#renderagreement선택자-옵션
    paymentWidget.renderAgreement("#agreement", {
      variantKey: "AGREEMENT",
    });
  }, [paymentWidget, customerKey, price, orderName]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    // ------ 금액 업데이트 ------
    // @docs https://docs.tosspayments.com/reference/widget-sdk#updateamount결제-금액
    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  return (
    <main>
      <div className="wrapper">
        <div className="box_section">
          <div id="payment-widget" style={{ width: "100%" }} />
          <div id="agreement" style={{ width: "100%" }} />
          {/* <div style={{ paddingLeft: "24px" }}>
            <div className="checkable typography--p">
              <label
                htmlFor="coupon-box"
                className="checkable__label typography--regular"
              >
                <input
                  id="coupon-box"
                  className="checkable__input"
                  type="checkbox"
                  aria-checked="true"
                  onChange={(event) => {
                    setPrice(
                      event.target.checked ? price - 5_000 : price + 5_000
                    );
                  }}
                />
                <span className="checkable__label-text">5,000원 쿠폰 적용</span>
              </label>
            </div>
          </div> */}
          <div className="result wrapper">
            <button
              className="button"
              style={{ marginTop: "30px" }}
              onClick={async () => {
                try {
                  // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
                  // @docs https://docs.tosspayments.com/reference/widget-sdk#requestpayment결제-정보
                  await paymentWidget?.requestPayment({
                    orderId: nanoid(),
                    orderName: orderName,
                    customerName: "김토스",
                    customerEmail: "customer123@gmail.com",
                    customerMobilePhone: "01012341234",
                    successUrl: `${window.location.origin}/payment/success`,
                    failUrl: `${window.location.origin}/payment/fail`,
                  });
                } catch (error) {
                  // 에러 처리하기
                  console.error(error);
                }
              }}
            >
              결제하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default withAuth(CheckoutPage);

function usePaymentWidget(clientKey: string, customerKey: string) {
  return useQuery({
    queryKey: ["payment-widget", clientKey, customerKey],
    queryFn: () => {
      // ------  결제위젯 초기화 ------
      // @docs https://docs.tosspayments.com/reference/widget-sdk#sdk-설치-및-초기화
      return loadPaymentWidget(clientKey, customerKey);
    },
  });
}