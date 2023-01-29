import React, { useEffect, useState } from "react";
import { Col, Row, Spin, Button, Divider, Modal, List, Card } from "antd";
import { actions } from "../../actions";

import BasicModal from "../common/modal/BasicModal";
import { useDispatch, useSelector } from "react-redux";
import { itemsCartSelector } from "../../selectors/cart";
import {
  productListSelectorSuggesstion,
  tbproductListLoadingSelectorSuggestion,
} from "../../selectors/product";
import Utils from "../../utils";
import { AppConstants } from "../../constants";
import noimage from "../../assets/images/noimage.png";
import ModalsFactory from "../common/appLayout/ModalsFactory";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import {
  PRODUCT_DETAIL_MODAL,
  PRODUCT_CHILD_MODAL,
  PRODUCT_CHILD_MODAL_DETAIL,
  PRODUCT_DETAIL_MODAL_SUGGESTION,
} from "../../constants/masterData";
const { Meta } = Card;
const { confirm } = Modal;

const ProductDetail = ({
  setShow,
  productId,
  categoryID,
  productName,
  HasChild,
}) => {
  const pagination = { pageSize: DEFAULT_PAGE_SIZE };
  const dispatch = useDispatch();
  const itemsCart = useSelector(itemsCartSelector);
  const productListSuggestion = useSelector(productListSelectorSuggesstion);
  const isLoadingProductListSuggestion = useSelector(
    tbproductListLoadingSelectorSuggestion
  );
  const [dataDetail, setdataDetail] = useState({});
  const [isLoading, setisLoading] = useState(true);
  const [quantityNotinCart, setQuantityNotinCart] = useState(1);
  const [quantityInCart, setQuantityInCart] = useState(1);
  const [showModal, setShowModal] = useState(-1);
  const [idHash, setIdHash] = useState();
  const [prepareUpdateCartChild, setprepareUpdateCartChild] = useState([]);
  const [productIDSuggestion, setproductIDSuggestion] = useState(null);
  const [productNameSuggestion, setproductNameSuggestion] = useState("");
  const [HasChildSuggestion, setHasChildSuggestion] = useState(false);

  useEffect(() => {
    const params = { id: productId };
    dispatch(
      actions.getProudctByIdClient({
        params,
        onCompleted: ({ data }) => {
          setdataDetail(data);
          if (!checkNotInCart(productId)) {
            if (HasChild) {
              let quantity = 0;
              let ChildItemCarts = itemsCart.filter((el) => {
                return el.parentId === productId;
              });

              for (let i = 0; i < ChildItemCarts.length; i++) {
                quantity = quantity + ChildItemCarts[i].quantity;
              }
              setQuantityInCart(quantity);
            } else {
              if (AvailableItem(productId) !== -1) {
                setQuantityInCart(itemsCart[AvailableItem(productId)].quantity);
              }
            }
          }

          setisLoading(false);
        },
        onError: (err) => {
          console.log(err);
        },
      })
    );

    dispatch(
      actions.getProductListClientSuggestion({
        params: {
          categoryId: categoryID,
          page: 0,
          size: pagination.pageSize,
        },
      })
    );
  }, []);

  const AvailableItem = (id) => {
    const indexItemsCart = itemsCart.findIndex((item) => {
      return item.id === id;
    });

    return indexItemsCart;
  };

  const AvailableItemChild = (id) => {
    const indexItemsCartChild = itemsCart.findIndex((item) => {
      return item.parentId === id;
    });

    return indexItemsCartChild;
  };

  const checkNotInCart = (id) => {
    if (HasChild) {
      if (AvailableItemChild(id) === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (AvailableItem(id) === -1) {
        return true;
      } else {
        return false;
      }
    }
  };

  const disableButton = (id) => {
    if (!checkNotInCart(id)) {
      if (quantityInCart === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      if (quantityNotinCart === 1) {
        return true;
      } else {
        return false;
      }
    }
  };

  const handleClickAddToCart = (dataDetail) => {
    let newItemsCart = JSON.parse(JSON.stringify(itemsCart));

    if (checkNotInCart(productId)) {
      if (HasChild) {
      } else {
        newItemsCart.push({
          categoryId: dataDetail.categoryId,
          id: dataDetail.id,
          productName: dataDetail.productName,
          productPrice: dataDetail.productPrice,
          quantity: quantityNotinCart,
        });
      }
    } else {
      if (HasChild) {
      } else {
        newItemsCart = newItemsCart.map((el) => {
          if (el.id !== productId) {
            return el;
          } else {
            return {
              ...el,
              quantity: quantityInCart,
            };
          }
        });

        if (newItemsCart[AvailableItem(productId)].quantity === 0) {
          console.log("runned when quantity reach to 0");
          newItemsCart = newItemsCart.filter((el) => {
            return el.id !== productId;
          });
        }
      }
    }
    setItemsCart(newItemsCart);
  };

  const handleDeleteItem = (dataDetail) => {
    confirm({
      title: "Xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      centered: true,
      onOk: () => {
        handleClickAddToCart(dataDetail);
        setShow(false);
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const addItem = (id) => {
    if (!checkNotInCart(id)) {
      if (HasChild) {
        setShowModal(PRODUCT_CHILD_MODAL_DETAIL);
      } else {
        setQuantityInCart(quantityInCart + 1);
      }
    } else {
      if (HasChild) {
        setShowModal(PRODUCT_CHILD_MODAL_DETAIL);
      } else {
        setQuantityNotinCart(quantityNotinCart + 1);
      }
    }
  };

  const minusItem = (id) => {
    if (!checkNotInCart(id)) {
      if (HasChild) {
        setShowModal(PRODUCT_CHILD_MODAL_DETAIL);
      } else {
        setQuantityInCart(quantityInCart - 1);
      }
    } else {
      if (HasChild) {
        setShowModal(PRODUCT_CHILD_MODAL_DETAIL);
      } else {
        setQuantityNotinCart(quantityNotinCart - 1);
      }
    }
  };

  const setItemsCart = (newItemsCart) => {
    dispatch(
      actions.setItemsCart({
        itemsCart: newItemsCart,
      })
    );
  };

  const getRandomlySuggestedProducts = (arr, numberOfSuggestions) => {
    const removeDuplicateSuggestedElement = arr.filter((el) => {
      return el.id !== productId;
    });

    const shuffledArray = [...removeDuplicateSuggestedElement].sort(
      () => 0.5 - Math.random()
    );

    return shuffledArray.slice(0, numberOfSuggestions);
  };

  const checkQuantity = (item) => {
    let quantity = 0;
    if (item.hasChild) {
      let ChildItemCarts = itemsCart.filter((el) => {
        return el.parentId === item.id;
      });

      for (let i = 0; i < ChildItemCarts.length; i++) {
        quantity = quantity + ChildItemCarts[i].quantity;
      }

      return quantity;
    } else {
      quantity = itemsCart[AvailableItem(item.id)].quantity;
      return quantity;
    }
  };

  const { data = [] } = productListSuggestion || {};

  return (
    <BasicModal
      visible={true}
      title={`Thông tin chi tiết sản phẩm - ${productName}`}
      width={1200}
      onCancel={() => {
        setShow(false);
      }}
      centered
      maskClosable
    >
      <div>
        <div className="product_info">
          <Spin
            size="large"
            wrapperClassName="full-screen-loading"
            spinning={isLoading}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div className="product_image">
                  <img
                    src={
                      dataDetail.productImage
                        ? `${AppConstants.contentRootUrl}${dataDetail.productImage}`
                        : noimage
                    }
                  ></img>
                </div>
              </Col>
              <Col span={12}>
                <div className="product_name">
                  <h3>{dataDetail?.productName}</h3>
                </div>
                <div className="product_price">
                  <span>
                    {`${Utils.formatNumber(dataDetail?.productPrice)} Đ`}
                  </span>
                </div>
                <div className="product_shortdescription">
                  <p>Mô tả sản phẩm</p>
                  <p style={{ color: "#2980b9" }}>
                    {dataDetail?.shortDescription}
                  </p>
                </div>
                <div className="product_quantity">
                  <p
                    className="inline-buttons"
                    style={{ "padding-right": "15px", "margin-left": "-5px" }}
                  >
                    Số lượng
                  </p>
                  <div className="inline-buttons">
                    <Button
                      size="large"
                      disabled={disableButton(productId)}
                      onClick={() => {
                        minusItem(productId);
                      }}
                    >
                      -
                    </Button>
                  </div>
                  <div className="inline-buttons" style={{ padding: "0 15px" }}>
                    <div style={{ "font-weight": "bold", color: "#2196F3" }}>
                      {!checkNotInCart(productId)
                        ? quantityInCart
                        : quantityNotinCart}
                    </div>
                  </div>
                  <div className="inline-buttons">
                    <Button
                      size="large"
                      onClick={() => {
                        addItem(productId);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div
                  className="product_addtocart"
                  onClick={() => {
                    if (checkNotInCart(productId)) {
                      if (HasChild) {
                        setShowModal(PRODUCT_CHILD_MODAL_DETAIL);
                      } else {
                        handleClickAddToCart(dataDetail);
                        setShow(false);
                      }
                    } else {
                      if (HasChild) {
                        setShow(false);
                      } else {
                        if (quantityInCart > 0) {
                          handleClickAddToCart(dataDetail);
                          setShow(false);
                        } else if (quantityInCart === 0) {
                          handleDeleteItem(dataDetail);
                        }
                      }
                    }
                  }}
                >
                  {!checkNotInCart(productId) ? (
                    <div>Cập nhật giỏ hàng</div>
                  ) : (
                    <div>Thêm vào giỏ hàng</div>
                  )}
                </div>
              </Col>
            </Row>
          </Spin>
        </div>
        <div className="product_longdescription">
          <Divider orientation="left">THÔNG TIN SẢN PHẨM</Divider>
          <div className="content">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  dataDetail && dataDetail.description
                    ? Utils.replaceUrlHelper(
                        dataDetail.description,
                        "{{baseUrl}}",
                        AppConstants.contentRootUrl
                      )
                    : null,
              }}
            ></div>
          </div>
        </div>
        <div className="suggesstion__container">
          <Divider orientation="left">Sản phẩm đề xuất</Divider>
          <Spin
            size="large"
            wrapperClassName="full-screen-loading"
            spinning={isLoadingProductListSuggestion}
          >
            {
              <List
                grid={{
                  gutter: 16,
                  column: 4,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                  xxl: 3,
                }}
                dataSource={getRandomlySuggestedProducts(data, 4) || []}
                pagination={false}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      style={{ border: "1px solid #d9d9d" }}
                      hoverable
                      cover={
                        <img
                          alt="example"
                          src={
                            item.productImage
                              ? `${AppConstants.contentRootUrl}${item.productImage}`
                              : noimage
                          }
                        />
                      }
                      onClick={() => {
                        if (item.hasChild) {
                          setHasChildSuggestion(true);
                          setproductIDSuggestion(item.id);
                          setproductNameSuggestion(item.productName);
                          setShowModal(PRODUCT_DETAIL_MODAL_SUGGESTION);
                        } else {
                          setHasChildSuggestion(false);
                          setproductIDSuggestion(item.id);
                          setproductNameSuggestion(item.productName);
                          setShowModal(PRODUCT_DETAIL_MODAL_SUGGESTION);
                        }
                      }}
                    >
                      <Meta
                        style={{ alignItems: "center" }}
                        title={item.productName}
                        description={`${Utils.formatNumber(
                          item.productPrice
                        )} Đ`}
                      />
                    </Card>
                  </List.Item>
                )}
              />
            }
          </Spin>
        </div>
        <ModalsFactory
          showModal={showModal}
          idHash={idHash}
          setShowModal={setShowModal}
          setIdHash={setIdHash}
          productId={productId}
          productName={productName}
          productIDSuggestion={productIDSuggestion}
          productNameSuggestion={productNameSuggestion}
          HasChildSuggestion={HasChildSuggestion}
          prepareUpdateCartChild={prepareUpdateCartChild}
          setprepareUpdateCartChild={setprepareUpdateCartChild}
          quantityInCart={quantityInCart}
          setQuantityInCart={setQuantityInCart}
        />
      </div>
    </BasicModal>
  );
};

export default ProductDetail;
