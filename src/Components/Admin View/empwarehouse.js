import React, { Fragment } from 'react';
import axios from 'axios';
import ModalComponent from './ModalComponent';
import Navbar from "../layout/navbar";
import './table.css';

export default class empwarehouse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: ["ID","IMAGE","TYPE","NAME","EMAIL","PWD","SALARY","DELETE","EDIT"],
            data: [],
            enamelist: [],
            eidlist: [],
            suggestions: [],
            rowDetails: {}
        };
        this.getData = this.getData.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.search = this.search.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        axios.get('http://localhost:5000/admin/warehouseList/get')
        .then(res => {
            console.log(res.data.message, res.data.data);
            const temp = res.data.data.map(obj => {
                delete obj.__v;
                return obj;
            });
            const tempname = [];
            const tempid = [];
            temp.forEach(obj => {
                tempname.push(obj.ename);
                tempid.push(obj._id);
            });
            this.setState({
                data: temp,
                enamelist: tempname,
                eidlist: tempid
            }); 
        });
    }

    handleDelete(row) {
        console.log("Delete!!", row);
        axios.delete("http://localhost:5000/admin/warehouseList/delete", {data: {id: row._id}})
            .then(res => {
                console.log(res.data.message);
                this.getData();
            })
    }

    handleEdit(row) {
        console.log("Edit!!", row);
        this.setState({
            rowDetails: row
        });
        document.getElementById('empadminBtn').click();
    }

    handleChange(e) {
        const tempname = [...this.state.enamelist];
        console.log(tempname);
        console.log(e.keyCode,e.target.value);
        const inputval = e.target.value;
        if(e.target.value.length === 0) {
            this.setState({
                suggestions: []
            });
            return;
        }
        let suggestedvalues = [];
        const tempid = this.state.eidlist;
        let key,value;
        for(key in tempname) {
            if(suggestedvalues.length <=5) {
                value = tempname[key];
                console.log(value, value.indexOf(inputval));
                if(value.toLowerCase().indexOf(inputval) > -1) {
                    suggestedvalues.push(value);
                }
            }
        } 
        for(key in tempid) {
            if(suggestedvalues.length <=5) {
                value = tempid[key];
                if(value.toLowerCase().indexOf(inputval) > -1) {
                    suggestedvalues.push(value);
                }
            }
        } 
        this.setState({
            suggestions: [...suggestedvalues]
        });
        console.log(suggestedvalues);
    }

    handleKeyUp(e) {
        if (e.keyCode === 13) {
            const valtosearch = this.state.suggestions[0];
            this.search(valtosearch);
        }
    }

    handleClick() {
        this.search(this.state.suggestions[0]);
    }

    search(name) {
        console.log(name);
        let id = '';
        this.state.data.forEach(elem => {
            if(elem.ename === name) {
                id = elem._id;
            } else if(elem._id === name) {
                id = elem._id;
            }
        })
        document.getElementById("warehouserecordtabrow" + id).scrollIntoView();
    }

    render(){
        return(
            <Fragment>
                <Navbar type='adminrecordwarehouse'/>
                <div className="search my-0">
                    <input className="searchTerm" id="warehouserecordsearch" type="text" placeholder="Search by name or id..." onChange={this.handleChange} onKeyUp={this.handleKeyUp}/>
                    <button type="button" className="searchbutton" onClick={this.handleClick}>
                        Search
                    </button>
                </div>
                <ul className="searchContainer" id="warehouserecordsearchContainer">
                {
                    this.state.suggestions.map(elem => {
                        return (
                            <li key={elem}>
                                <button type="button" className="searchSuggest"
                                onClick={() => {
                                    this.search(elem);
                                }}>{elem}</button>
                            </li>
                        )
                    })
                }
                </ul>
                <table id="t01">
                    <tbody>
                    <tr>
                        {this.state.columns.map(data => <th key={data}>{data}</th>)}
                    </tr>
                    {this.state.data.map(row => {
                                return(
                                <tr key={row._id} id={"warehouserecordtabrow" + row._id}>
                                    {Object.keys(row).map(rowdatakey => {
                                            if(rowdatakey !== 'eimg')
                                            return <td key={rowdatakey}>{row[rowdatakey]}</td>
                                            else {
                                                const img = row[rowdatakey];
                                                return <td key={rowdatakey}><img src={img} width="100" height ="100" alt={row['ename']}/></td>
                                            }
                                        })}
                                    <td><button type="button" className="editwh mx-1" onClick= {() => {
                                        this.handleDelete(row);
                                    }}><i className="fa fa-remove"></i></button></td>
                                    <td><button type="button" className="delwh mx-1" onClick= {() => {this.handleEdit(row)}}><i className="fa fa-edit"></i></button></td>
                                </tr>
                                );
                            })
                    }
                    </tbody>
                </table>
                <ModalComponent row={this.state.rowDetails} get={this.getData} token='warehouse'/>
            </Fragment>
        );
    }
}