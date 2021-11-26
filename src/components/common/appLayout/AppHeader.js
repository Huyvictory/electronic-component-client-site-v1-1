import React from 'react'
import { Layout, Menu, Space, Typography, Avatar, Input } from 'antd'
import { Link } from 'react-router-dom'

import { sitePathConfig } from '../../../constants/sitePathConfig'
import { useLocation } from 'react-router'

import { UserOutlined } from '@ant-design/icons'
import logo from '../../../assets/images/logoelectronic.jpg'
import cart from '../../../assets/images/cart.jpg'

const { Header } = Layout
const { Text } = Typography
const { SubMenu } = Menu
const {Search} = Input

const menus = [
    {
        title: 'Về chúng tôi',
        path: sitePathConfig.aboutUs.path,
    },
    {
        title: 'Hồ sơ',
        subs: [
            {
                title: 'Hồ sơ cá nhân',
                path: sitePathConfig.updateProfile.path,
            },
            {
                title: 'Hồ sơ năng lực',
                path: sitePathConfig.competences.path,
            },
        ],
    },
    {
        title: 'Khảo sát',
        path: sitePathConfig.exams.path,
    },
]

const AppHeader = ({ isAuth, onLogout, shortName, avatar }) => {
    const location = useLocation()

    return (
        <Header className="app-header">
            <div className="logo">
                <img src={logo} alt=''/>
            </div>
            <Menu
                className="app-menu"
                theme="light"
                mode="horizontal"
                selectedKeys={[location.pathname]}
            >
            <Search
                placeholder="Nhập tên sản phẩm muốn tìm"
                allowClear
                enterButton="Search"
                size="large"
                className='searchbar'
            />
                {isAuth && (
                    <SubMenu
                        key="logged-subMenu"
                        title={<Text strong>{shortName}</Text>}
                        icon={
                            <Avatar
                                size={24}
                                src={avatar}
                                icon={<UserOutlined />}
                            />
                        }
                        className="menu-right-logged"
                    >
                        <Menu.Item
                            key={sitePathConfig.updateProfile.path + '2'}
                        >
                            <Link to={sitePathConfig.updateProfile.path}>
                                <Text strong>Hồ sơ</Text>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="#" onClick={onLogout}>
                            <Text strong>Đăng xuất</Text>
                        </Menu.Item>
                    </SubMenu>
                )}
            </Menu>
            {!isAuth && (
                <Menu
                    className="app-menu-right"
                    theme="light"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    key="menu-right"
                >
                    <Menu.Item key={sitePathConfig.login.path}>
                        <Link to={sitePathConfig.login.path}>
                            <Text strong>Đăng nhập</Text>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key={sitePathConfig.register.path}>
                        <Link to={sitePathConfig.register.path}>
                            <Text strong>Đăng ký</Text>
                        </Link>
                    </Menu.Item>
                    <Menu.Item to="/" key="2">
                        <img className="ant-menu-item" src= {cart} alt='cart'/>
                        <span>Shopify</span>
                        <Link to="/">Home</Link>
                    </Menu.Item>
                </Menu>
            )}
        </Header>
    )
}

export default AppHeader
