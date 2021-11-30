import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productListSelector, tbproductListLoadingSelector } from "../../selectors/product";
import {actions} from '../../actions/product';
import { List, Card, Spin } from 'antd';
import {AppConstants} from '../../constants/index';
import noimage from '../../assets/images/noimage.png';


const { Meta } = Card;

const ProductListPage = () => {

    const productList = useSelector(productListSelector)
    const isLoading = useSelector(tbproductListLoadingSelector);
    console.log(isLoading);
    const dispatch = useDispatch();
    console.log(productList);
    useEffect(() => {
        dispatch(actions.getProductListClient(
            {
                params: {
                    // categoryId: 88,
                    page: 0,
                    size: 13,
                }
            }
        ))
    }, [])
    
    const { data = [] } = productList || {}
    return (
        <Spin size="large" wrapperClassName="full-screen-loading" spinning={isLoading}>
            {
                <List
                grid={{ 
                  gutter: 16, 
                  column: 4,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 4,
                  xxl: 3, }}
                dataSource={data}
                pagination={{
                    onChange: page => {
                      console.log(page);
                    },
                    pageSize: 12,
                  }}
                renderItem={item => (
                  <List.Item>
                    <Card 
                        style={{border: '1px solid #d9d9d'}}
                        hoverable
                        cover={<img alt="example" src= {item.productImage ? `${AppConstants.contentRootUrl}${item.productImage}` : noimage} />}
                        actions={[`Thêm vào giỏ hàng`]}
                        >
                          <Meta
                            style={{alignItems: 'center'}}
                            title={item.productName} 
                            description={`${item.productPrice} Đ`}
                          />
                        </Card>
                  </List.Item>
                )}
              />
            }
        </Spin>
    )
}

export default ProductListPage;