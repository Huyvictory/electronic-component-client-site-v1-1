import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  productListSelector,
  tbproductListLoadingSelector,
  newFilterValue1Selector,
  newFilterValue2Selector,
  tbproductBestSellingLoading,
  productsBestSellingSelector,
} from "../../selectors/product";
import { itemsCartSelector } from "../../selectors/cart";
import { actions } from "../../actions";
import { List, Card, Spin, Button, Modal, Divider } from "antd";
import { AppConstants } from "../../constants/index";
import noimage from "../../assets/images/noimage.png";
import Utils from "../../utils";
import { DEFAULT_PAGE_SIZE } from "../../constants";
import ModalsFactory from "../../components/common/appLayout/ModalsFactory";
import {
  PRODUCT_DETAIL_MODAL,
  PRODUCT_CHILD_MODAL,
} from "../../constants/masterData";

const { Meta } = Card;
const { confirm } = Modal;

const ProductListPage = () => {
  const productList = useSelector(productListSelector);
  const productBestSellingList = useSelector(productsBestSellingSelector);
  const isLoading = useSelector(tbproductListLoadingSelector);
  const isLoadingProductsBestSelling = useSelector(tbproductBestSellingLoading);
  const itemsCart = useSelector(itemsCartSelector);
  const newFilterValue1 = useSelector(newFilterValue1Selector);
  const newFilterValue2 = useSelector(newFilterValue2Selector);

  console.log(newFilterValue1, newFilterValue2);

  console.log(itemsCart);
  const dispatch = useDispatch();

  const pagination = { pageSize: DEFAULT_PAGE_SIZE };
  const [showModal, setShowModal] = useState(-1);
  const [idHash, setIdHash] = useState();
  const [productID, setproductID] = useState(null);
  const [productName, setproductName] = useState("");
  const [categoryID, setcategoryID] = useState(null);
  const [HasChild, setHasChild] = useState(false);

  const handleDeleteItem = (index) => {
    confirm({
      title: "Xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      centered: true,
      onOk: () => {
        minusItem(index);
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

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

  const checkCart = (item) => {
    if (item.hasChild) {
      if (AvailableItemChild(item.id) === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (AvailableItem(item.id) === -1) {
        return true;
      } else {
        return false;
      }
    }
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

  const handleClickAddToCart = (product) => {
    const index = itemsCart.findIndex((item) => {
      return item.id === product.id;
    });

    if (index === -1) {
      const newItemsCart = JSON.parse(JSON.stringify(itemsCart));
      newItemsCart.push({
        ...product,
        quantity: 1,
      });

      setItemsCart(newItemsCart);
    }
  };

  const addItem = (index) => {
    let newItemsCart = JSON.parse(JSON.stringify(itemsCart));

    newItemsCart = newItemsCart.map((el) =>
      el.id !== index ? el : { ...el, quantity: el.quantity + 1 }
    );
    setItemsCart(newItemsCart);
  };

  const minusItem = (index) => {
    let newItemsCart = JSON.parse(JSON.stringify(itemsCart));

    for (let i = 0; i < newItemsCart.length; i++) {
      if (newItemsCart[i].id === index) {
        if (newItemsCart[i].quantity > 1) {
          newItemsCart[i] = {
            ...newItemsCart[i],
            quantity: newItemsCart[i].quantity - 1,
          };
          setItemsCart(newItemsCart);
          break;
        } else {
          newItemsCart = newItemsCart.filter((el) => el !== newItemsCart[i]);
          setItemsCart(newItemsCart);
          break;
        }
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

  useEffect(() => {
    const page = pagination.current ? pagination.current - 1 : 0;
    dispatch(
      actions.getProductListClient({
        params: {
          // categoryId: 88,
          page: page,
          size: pagination.pageSize,
          newFilterValue1,
          newFilterValue2,
        },
      })
    );
    dispatch(
      actions.getBestSellingProductBySize({
        params: {
          size: 5,
        },
      })
    );
  }, []);

  const { data = [] } = productList || {};
  console.log(productBestSellingList);
  pagination.total = productList.totalElements;

  function areEquals(a, b) {
    var keys1 = Object.keys(a);
    var keys2 = Object.keys(b);

    if (a["categoryId"] !== b["categoryId"]) {
      return false;
    }
    return true;
  }
  function checkArray(arr) {
    for (var i = 1; i < data.length; i++) {
      if (!areEquals(arr[0], arr[i])) return false;
    }
    return true;
  }

  console.log(checkArray(data));
  return (
    <Spin
      size="large"
      wrapperClassName="full-screen-loading"
      spinning={isLoading}
    >
      <div id="app-content">
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
            dataSource={data}
            pagination={{
              onChange: (page) => {
                dispatch(
                  actions.getProductListClient({
                    params: {
                      categoryId: checkArray(data) ? data[0].categoryId : null,
                      page: page - 1,
                      size: pagination.pageSize,
                      newFilterValue1,
                      newFilterValue2,
                    },
                  })
                );
              },
              ...pagination,
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
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
                      setHasChild(true);
                      setproductID(item.id);
                      setcategoryID(item.categoryId);
                      setproductName(item.productName);
                      setShowModal(PRODUCT_DETAIL_MODAL);
                    } else {
                      setHasChild(false);
                      setproductID(item.id);
                      setcategoryID(item.categoryId);
                      setproductName(item.productName);
                      setShowModal(PRODUCT_DETAIL_MODAL);
                    }
                  }}
                >
                  <Meta
                    style={{ alignItems: "center" }}
                    title={item.productName}
                    description={`${Utils.formatNumber(item.productPrice)} Đ`}
                  />
                </Card>
                {checkCart(item) ? (
                  <div
                    className="button-add-to-cart"
                    onClick={() => {
                      if (item.hasChild) {
                        setproductID(item.id);
                        setproductName(item.productName);
                        setShowModal(PRODUCT_CHILD_MODAL);
                      } else {
                        handleClickAddToCart(item);
                      }
                    }}
                  >
                    <div>Thêm vào giỏ hàng</div>
                  </div>
                ) : (
                  <div className="container-plus-minus-buttons">
                    <div className="inline-buttons">
                      <Button
                        size="large"
                        onClick={() => {
                          if (item.hasChild) {
                            setproductID(item.id);
                            setproductName(item.productName);
                            setShowModal(PRODUCT_CHILD_MODAL);
                          } else {
                            if (
                              itemsCart[AvailableItem(item.id)].quantity > 1
                            ) {
                              minusItem(item.id);
                            } else {
                              handleDeleteItem(item.id);
                            }
                          }
                        }}
                      >
                        -
                      </Button>
                    </div>
                    <div
                      className="inline-buttons"
                      style={{ padding: "0 15px" }}
                    >
                      <div style={{ fontWeight: "bold", color: "#2196F3" }}>
                        {checkQuantity(item)}
                      </div>
                    </div>
                    <div className="inline-buttons">
                      <Button
                        size="large"
                        onClick={() => {
                          if (item.hasChild) {
                            setproductID(item.id);
                            setproductName(item.productName);
                            setShowModal(PRODUCT_CHILD_MODAL);
                          } else {
                            addItem(item.id);
                          }
                        }}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
              </List.Item>
            )}
          />
        }
      </div>

      <Divider orientation="left">
        Danh sách sản phẩm bán chạy nhất shop
      </Divider>
      {/* For best selling products list */}
      <List
        loading={isLoadingProductsBestSelling}
        grid={{
          gutter: 16,
          column: 4,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xxl: 3,
        }}
        dataSource={productBestSellingList || []}
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
                  setHasChild(true);
                  setproductID(item.id);
                  setcategoryID(item.categoryId);
                  setproductName(item.productName);
                  setShowModal(PRODUCT_DETAIL_MODAL);
                } else {
                  setHasChild(false);
                  setproductID(item.id);
                  setcategoryID(item.categoryId);
                  setproductName(item.productName);
                  setShowModal(PRODUCT_DETAIL_MODAL);
                }
              }}
            >
              <Meta
                style={{ alignItems: "center" }}
                title={item.productName}
                description={`${Utils.formatNumber(item.productPrice)} Đ`}
              />
            </Card>
            {checkCart(item) ? (
              <div
                className="button-add-to-cart"
                onClick={() => {
                  if (item.hasChild) {
                    setproductID(item.id);
                    setproductName(item.productName);
                    setShowModal(PRODUCT_CHILD_MODAL);
                  } else {
                    handleClickAddToCart(item);
                  }
                }}
              >
                <div>Thêm vào giỏ hàng</div>
              </div>
            ) : (
              <div className="container-plus-minus-buttons">
                <div className="inline-buttons">
                  <Button
                    size="large"
                    onClick={() => {
                      if (item.hasChild) {
                        setproductID(item.id);
                        setproductName(item.productName);
                        setShowModal(PRODUCT_CHILD_MODAL);
                      } else {
                        if (itemsCart[AvailableItem(item.id)].quantity > 1) {
                          minusItem(item.id);
                        } else {
                          handleDeleteItem(item.id);
                        }
                      }
                    }}
                  >
                    -
                  </Button>
                </div>
                <div className="inline-buttons" style={{ padding: "0 15px" }}>
                  <div style={{ fontWeight: "bold", color: "#2196F3" }}>
                    {checkQuantity(item)}
                  </div>
                </div>
                <div className="inline-buttons">
                  <Button
                    size="large"
                    onClick={() => {
                      if (item.hasChild) {
                        setproductID(item.id);
                        setproductName(item.productName);
                        setShowModal(PRODUCT_CHILD_MODAL);
                      } else {
                        addItem(item.id);
                      }
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </List.Item>
        )}
      />
      <ModalsFactory
        showModal={showModal}
        idHash={idHash}
        setShowModal={setShowModal}
        setIdHash={setIdHash}
        productId={productID}
        categoryID={categoryID}
        productName={productName}
        handleClickAddToCart={handleClickAddToCart}
        AvailableItem={AvailableItem}
        minusItem={minusItem}
        addItem={addItem}
        handleDeleteItem={handleDeleteItem}
        HasChild={HasChild}
      />
    </Spin>
  );
};

export default ProductListPage;
