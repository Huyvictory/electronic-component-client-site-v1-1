import { Layout, Breadcrumb, Modal } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../../actions";
import sitePathConfig from "../../../constants/sitePathConfig";
import { isAuthentication, userDataSelector } from "../../../selectors/account";
import { clsx } from "../../../utils/helper";
import Utils from "../../../utils/index";
import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import NavigationBar from "./NavigationBar";
import Banner from "./Banner";
import NavSider from "./NavSider";
import NavSiderNews from "./NavSiderNews";
import { Link } from "react-router-dom";
import { itemsCartSelector } from "../../../selectors/cart";
import BreadcurmbCustom from "./BreadcrumbCustom";
import {
  settingsListSelector,
  tbsettingsListLoadingSelector,
} from "../../../selectors/settings";

const { Content } = Layout;
const { confirm } = Modal;

const MasterLayout = ({ children, history, isNews }) => {
  const dispatch = useDispatch();
  const isAuth = useSelector(isAuthentication);
  const userData = useSelector(userDataSelector);
  const itemsCart = useSelector(itemsCartSelector);
  const settingsList = useSelector(settingsListSelector);
  const [breadcrumbs, setBreadCumbs] = useState([]);
  const [settingsObjectList, setsettingsObjectList] = useState({
    Hotline: "(028) 64700104",
    LogoClient: "/AVATAR/AVATAR_sbzKpK0cAR.",
    WelcomeText: "Chào mừng đến với thế giới linh kiện điện tử...",
    OpeningTime: "7h30 - 12h, 13h30 - 19h",
    Footer: "© Copyright 2021. All rights reserved by ...",
    timetocancel: "6",
  });
  const { contentClass } = useMemo(() => {
    const { layoutConfig = {} } =
      Object.values(sitePathConfig).find(
        (site) => site.path === history.location.pathname
      ) || {};
    return layoutConfig;
  }, [history.location.pathname]);

  const onLogout = () => {
    confirm({
      title: "Đăng xuất",
      content: "Bạn có chắc muốn đăng xuất?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      centered: true,
      onOk: () => {
        dispatch(
          actions.logout({
            onCompleted: () => {
              window.location.href = window.location.origin;
            },
          })
        );
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const onChangeBreadcrumb = (breadcrumbsparam) => {
    setBreadCumbs(breadcrumbsparam);
  };

  useEffect(() => {
    if (history.action === "PUSH") {
      window.scrollTo(0, 0);
    }
  }, [history.location.pathname]);

  useEffect(() => {
    const page = 0;
    dispatch(
      actions.getSettingsListClient({
        params: {
          page: page,
          size: 20,
        },
      })
    );
  }, []);

  useEffect(() => {
    if (typeof settingsList.data === "undefined") {
      console.log(undefined);
    } else {
      console.log(settingsList.data);
      const settingsObject = settingsList.data.reduce((obj, cur) => {
        return {
          ...obj,
          [cur.key]: cur.value,
        };
      }, {});
      console.log(settingsObject);
      setsettingsObjectList(settingsObject);
    }
  }, [settingsList]);

  return (
    <Layout className="master-layout">
      <div
        style={{
          background: "white",
        }}
      >
        <div style={{ "border-bottom": "1px solid #d9d9d9" }}>
          <div className="helloheader">
            <div className="toplefttext">{settingsObjectList.WelcomeText}</div>
            <div>{`Mở cửa: ${settingsObjectList.OpeningTime}`}</div>
          </div>
        </div>
        <AppHeader
          onLogout={onLogout}
          isAuth={isAuth}
          shortName={(userData.customerFullName || "Khách").split(" ").pop()}
          avatar={Utils.getFileUrl(userData?.customerAvatarPath)}
          itemsCart={itemsCart || []}
          logo={settingsObjectList.LogoClient}
          timetoCancel={settingsObjectList.timetocancel}
        />
      </div>

      <NavigationBar hotline={settingsObjectList.Hotline}></NavigationBar>
      {!isNews && <Banner />}
      <div style={{ background: "#F5F5F5" }}>
        <Layout className="containtersider">
          <BreadcurmbCustom
            breadcrumbs={breadcrumbs}
            changeBreadcrumb={onChangeBreadcrumb}
          />
        </Layout>
        <Layout className="containtersider">
          {!isNews && (
            <NavSider
              breadcrumbs={breadcrumbs}
              changeBreadcrumb={onChangeBreadcrumb}
            />
          )}
          {isNews && (
            <NavSiderNews
              breadcrumbs={breadcrumbs}
              changeBreadcrumb={onChangeBreadcrumb}
            />
          )}
          <Layout>
            <Content className="app-content">
              <div className="content-wrapper">
                {React.cloneElement(children, {
                  // changeUserData: this.onChangeUserData,
                  currentUser: userData,
                  changeBreadcrumb: onChangeBreadcrumb,
                  breadcrumbs: breadcrumbs,
                  // showFullScreenLoading,
                  // hideFullScreenLoading
                })}
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
      <AppFooter footerContent={settingsObjectList.Footer} />
    </Layout>
  );
};

export default MasterLayout;
