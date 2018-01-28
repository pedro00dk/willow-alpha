import React from 'react'
import { render } from 'react-dom'
import { Navbar, NavbarBrand, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'


export default class Header extends React.Component {

    render() {
        return (
            <Navbar fluid collapseOnSelect style={{ marginBottom: '0px' }}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href='#'>Willow</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavDropdown id='header-dropdown-exercises' title='Exercises'>
                            <MenuItem>Menu Item</MenuItem>
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        <NavItem href='#'>
                            Sign up
                        </NavItem>
                        <NavItem href='#'>
                            Log in
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}