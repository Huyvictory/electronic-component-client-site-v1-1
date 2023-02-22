import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Input } from "antd";
import Fuse from "fuse.js";

import { actions } from "../../../actions";
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE } from "../../../constants";
import { productSearchListSelector } from "../../../selectors/product";
import Utils from "../../../utils";

const { Search } = Input;

function SearchBar() {
  const dispatch = useDispatch();
  const productSearchList = useSelector(productSearchListSelector);
  const [fuse, setFuse] = useState();
  const [searchItemsList, setSearchItemsList] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  const buildIndex = (data) => {
    setFuse(
      new Fuse(data, {
        includeScore: true,
        threshold: 0.4,
        keys: ["productName"],
      })
    );
  };

  const handleChangeSearchInput = (event) => {
    console.log(event.target.value);
    const { value = "" } = event.target;
    const res = fuse && fuse.search(value);
    if (!value) {
      setSearchItemsList([]);
    } else {
      setSearchItemsList(
        res.map((e) => {
          return e.item;
        })
      );
    }
    setSearchInput(value);
  };

  const fetchProductListAutoComplete = () => {
    dispatch(
      actions.getProductAutoComplete({
        params: {},
      })
    );
  };

  const fetchProductClientList = ({ name }) => {
    dispatch(
      actions.getProductListClient({
        params: {
          name,
          page: 0,
          size: DEFAULT_TABLE_ITEM_SIZE,
        },
        onCompleted: () => {
          document.getElementById("app-content").scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        },
      })
    );
  };

  const handleClickItemSearched = (item) => {
    fetchProductClientList({
      name: item.productName,
    });
    setSearchItemsList([]);
    setSearchInput(item.productName);
  };

  useEffect(() => {
    productSearchList && buildIndex(productSearchList);
  }, [productSearchList]);

  useEffect(() => {
    fetchProductListAutoComplete();
  }, []);

  return (
    <div class="searchbar">
      <Layout style={{ height: "100%" }}>
        <Layout.Header
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            height: "100%",
          }}
        >
          <Search
            placeholder="Nhập tên sản phẩm muốn tìm"
            allowClear
            enterButton="Tìm kiếm"
            size="large"
            onChange={handleChangeSearchInput}
            value={searchInput}
          />
          {searchItemsList.length > 0 && (
            <div className="search-result">
              {searchItemsList.map((item) => {
                return (
                  <div
                    className="item"
                    key={item.id}
                    onClick={() => handleClickItemSearched(item)}
                  >
                    <div className="image">
                      {item.productImage && (
                        <img
                          src={AppConstants.contentRootUrl + item.productImage}
                        />
                      )}
                    </div>
                    <div className="name">{item.productName}</div>
                    <div className="price">
                      {Utils.formatMoney(item.productPrice)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Layout.Header>
      </Layout>
    </div>
  );
}

export default SearchBar;
