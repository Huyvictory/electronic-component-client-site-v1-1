import React, { Component } from "react";
import {
  Layout,
  Menu,
  Spin,
  Breadcrumb,
  InputNumber,
  Row,
  Col,
  Slider,
  Divider,
  Button,
} from "antd";
import { Link } from "react-router-dom";
import { navMenuConfig } from "../../../constants/menuConfig";
import { AppConstants } from "../../../constants";
import { actions } from "../../../actions";
import { connect, useDispatch } from "react-redux";
import { categoryKinds } from "../../../constants/masterData";
import { CaretRightOutlined, BarsOutlined } from "@ant-design/icons";
import { DEFAULT_PAGE_SIZE } from "../../../constants";

const { Sider } = Layout;
const { SubMenu } = Menu;

class NavSider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingMenuItem: null,
      breadcrumbs: [],
      inputValue1: 10000,
      inputValue2: 55000,
    };
    this.onChangeInputValue1 = this.onChangeInputValue1.bind(this);
    this.onChangeInputValue2 = this.onChangeInputValue2.bind(this);
    this.breadcrumbs = [];
    this.pagination = { pageSize: DEFAULT_PAGE_SIZE };
    this.getCategoryTypeProducts();
  }

  handleLoadingMenuItem = (menuPath) => {
    this.setState({ loadingMenuItem: menuPath });
    return true;
  };

  onChangeInputValue1(newFilterValue1) {
    const {getPriceFilter1} = this.props;
    getPriceFilter1({newFilterValue1});
    this.setState({ inputValue1: newFilterValue1 });
  }

  onChangeInputValue2(newFilterValue2) {
    const {getPriceFilter2} = this.props;
    getPriceFilter2({newFilterValue2});
    this.setState({ inputValue2: newFilterValue2 });
  }

  getList(categoryId) {
    const { getDataList, newFilterValue1, newFilterValue2 } = this.props;
    const page = this.pagination.current ? this.pagination.current - 1 : 0;
    const params = { page, size: DEFAULT_PAGE_SIZE, categoryId: categoryId, newFilterValue1, newFilterValue2 };
    getDataList({ params });
  }

  getListFilterByPrice(newFilterValue1, newFilterValue2) {
    const { getDataList } = this.props;
    console.log(this.pagination);
    const page = this.pagination.current ? this.pagination.current - 1 : 0;
    const params = { page, size: DEFAULT_PAGE_SIZE, newFilterValue1, newFilterValue2 };
    getDataList({ params });
  }

  getCategoryTypeProducts() {
    const { getCategoryTypeProducts } = this.props;
    const params = { kind: categoryKinds.CATEGORY_KIND_PRODUCT };
    getCategoryTypeProducts({ params });
  }

  onChangeBreadcrumb(breadcrumbs) {
    this.setState({ breadcrumbs });
  }

  render() {
    const {
      onToggleNavSide,
      currentPathname,
      navSidercollapsed,
      userData,
      categoryList,
      loading,
    } = this.props;
    const { loadingMenuItem, breadcrumbs, inputValue1 } = this.state;

    console.log(breadcrumbs);

    let CategoryList = [];

    if (!loading) {
      const productCategoryList = categoryList.data || [];

      CategoryList = [...productCategoryList];

      CategoryList = CategoryList.map((el) => {
        return {
          label: el.categoryName,
          value: el.id,
        };
      });
    }

    return (
      <div>
        <Spin
          size="small"
          wrapperClassName="full-screen-loading"
          spinning={loading}
        >
          <Sider
            width={200}
            // collapsible
            collapsed={navSidercollapsed}
            onCollapse={onToggleNavSide}
            className={
              navSidercollapsed
                ? "nav-sider nav-sider__collapsed"
                : "nav-sider nav-sider__expanded"
            }
          >
            <Menu theme="dark" mode="inline" className="custom-nav">
              <Menu.Item
                className="custom-nav-item"
                key="getall"
                onClick={(e) => {
                  this.props.changeBreadcrumb([{ name: "Tất cả" }]);
                  this.getList();
                }}
              >
                <Link to={`/productList`}>
                  <span>
                    <BarsOutlined /> Tất cả sản phẩm
                  </span>
                </Link>
              </Menu.Item>
              {!loading &&
                CategoryList.map((navMenuItem, idx) => (
                  <Menu.Item
                    className="custom-nav-item"
                    key={navMenuItem.value}
                    onClick={(e) => {
                      this.props.changeBreadcrumb([
                        { name: navMenuItem.label },
                      ]);
                      this.getList(navMenuItem.value);
                    }}
                  >
                    <Link to={`/productList?categoryId=${navMenuItem.value}`}>
                      <span>
                        <CaretRightOutlined /> {`${navMenuItem.label}`}
                      </span>
                    </Link>
                  </Menu.Item>
                ))}
            </Menu>
          </Sider>
          <Divider orientation={"left"}>Giá thấp nhất</Divider>
          <Row>
            <Col span={12}>
              <Slider
                min={10000}
                max={50000}
                onChange={this.onChangeInputValue1}
                value={
                  typeof this.state.inputValue1 === "number"
                    ? this.state.inputValue1
                    : 0
                }
              />
            </Col>
            <Col span={12}>
              <InputNumber
                style={{ margin: "0 10px" }}
                min={10000}
                max={50000}
                value={this.state.inputValue1}
                onChange={this.onChangeInputValue1}
              />
            </Col>
          </Row>
          <Divider orientation={"left"}>Giá cao nhất</Divider>
          <Row>
            <Col span={12}>
              <Slider
                min={55000}
                max={3000000}
                onChange={this.onChangeInputValue2}
                value={
                  typeof this.state.inputValue2 === "number"
                    ? this.state.inputValue2
                    : 0
                }
              />
            </Col>
            <Col span={12}>
              <InputNumber
                style={{ margin: "0 10px" }}
                min={55000}
                max={3000000}
                value={this.state.inputValue2}
                onChange={this.onChangeInputValue2}
              />
            </Col>
          </Row>
          {/* <Button
            onClick={() => {
              this.getListFilterByPrice(
                this.state.inputValue1,
                this.state.inputValue2
              );
            }}
            style={{ width: "100%", margin: "16px 0" }}
          >
            Lọc theo giá
          </Button> */}
        </Spin>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: state.product.tbproductLoading,
  dataList: state.product.productData || {},
  categoryList: state.product.productCategoryType || {},
  newFilterValue1: state.product.newFilterValue1,
  newFilterValue2: state.product.newFilterValue2
});

const mapDispatchToProps = (dispatch) => ({
  getDataList: (payload) => dispatch(actions.getProductListClient(payload)),
  getCategoryTypeProducts: (payload) =>
    dispatch(actions.getCategoryTypeProducts(payload)),
  getPriceFilter1: (payload) =>
    dispatch(actions.getProductFilterPrice1(payload)),
  getPriceFilter2: (payload) =>
    dispatch(actions.getProductFilterPrice2(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NavSider);
