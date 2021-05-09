import { Component, OnInit } from '@angular/core';
import { SearchdataService } from 'src/app/services/searchdata.service';
declare const Tabulator: any;
@Component({
  selector: 'app-searchview',
  templateUrl: './searchview.component.html',
  styleUrls: ['./searchview.component.scss']
})
export class SearchviewComponent implements OnInit {

  pageNo = 0;
  totalSize = 5000;

  constructor(
    private searchServ: SearchdataService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): any {
    const cb = (cell: any, formatterParams: any, onRendered: any) => {
      // console.log(cell, formatterParams, onRendered);
      const image = cell._cell.row.data.picture;
      const name = cell._cell.row.data.name;
      return '<div><img src="' + image + '" class="img-circle" alt="Name" style="float:left;width: 30px; height: 30px;"><p>&nbsp;' + name + '</p></div>';
    };
    const table: any = new Tabulator('#filter-table', {
      height: '450px',
      responsiveLayout: 'hide',
      layout: 'fitColumns',
      ajaxURL: 'https://randomuser.me/api/', // ?page=0&results=10', // https://randomuser.me/api/?page=0&results=10
      ajaxConfig: 'GET', // ajax HTTP request type
      ajaxContentType: 'json',
      pagination: 'remote',
      paginationSize: 10,
      paginationSizeSelector: [10, 20, 50, 100],
      placeholder: 'No Data Set',
      tooltips: true,
      columns: [
        {title: 'Full Name', field: 'name', width: 200, responsive: 0, formatter: cb},
        {title: 'Date Of Birth', field: 'dob', hozAlign: 'right', sorter: 'number', width: 150},
        {title: 'City', field: 'city', width: 150, responsive: 2, headerFilter: 'select', headerFilterParams: {values: true}, editor: 'input'},
        {title: 'Email', field: 'email', hozAlign: 'center', width: 150},
        {title: 'Phone Number', field: 'phone', width: 150}
      ],
      ajaxURLGenerator: (url: any, config: any, params: any) => {
        console.log('req', url, params, config);
        this.pageNo = params?.page;
        return url + '?page=' + params?.page + '&results=' + params?.size;
      },
      ajaxResponse: (url: any, params: any, response: any) => {
        console.log('response', url, params, response);
        let results: any[] = response.results;
        results = results.map((element: any, index: any) => {
          const obj: any = {};
          obj.name = element?.name?.title + ' ' + element?.name?.first + ' ' + element?.name?.last;
          obj.dob = element?.dob?.date;
          obj.city = element?.location?.city;
          obj.email = element?.email;
          obj.phone = element?.phone;
          obj.height = 50;
          obj.picture = element?.picture?.thumbnail;
          return obj;
        });
        console.log('res', results);

        // return results; // return the tableData property of a response json object
        return {
          last_page: this.totalSize / this.pageNo, // the total number of available pages (this value must be greater than 0)
          data: results
        };
      },
    });
    const custom = () => {
      try {
        // Define variables for input elements
        const fieldEl: any = document.getElementById('filter-field');
        const typeEl: any = document.getElementById('filter-type');
        const valueEl: any = document.getElementById('filter-value');

        // Custom filter example
        const customFilter = (data: any) => {
            return data.car && data.rating < 3;
        };

        // Trigger setFilter function with correct parameters
        const updateFilter = () => {
          const filterVal = fieldEl.options[fieldEl.selectedIndex].value;
          const typeVal = typeEl.options[typeEl.selectedIndex].value;

          const filter = filterVal === 'function' ? customFilter : filterVal;

          if (filterVal === 'function' ) {
            typeEl.disabled = true;
            valueEl.disabled = true;
          }else{
            typeEl.disabled = false;
            valueEl.disabled = false;
          }

          if (filterVal) {
            table.setFilter(filter, typeVal, valueEl.value);
          }
        };

        // Update filters on value change
        const h1: any = document.getElementById('filter-field');
        h1.addEventListener('change', updateFilter);
        const h2: any = document.getElementById('filter-type');
        h2.addEventListener('change', updateFilter);
        const h3: any = document.getElementById('filter-value');
        h3.addEventListener('keyup', updateFilter);

        // Clear filters on 'Clear Filters' button click
        const h4: any = document.getElementById('filter-clear');
        h4.addEventListener('click', () => {
          fieldEl.value = '';
          typeEl.value = 'like';
          valueEl.value = '';

          table.clearFilter();
        });
      } catch (e) {}
    };
    custom();
  }

}
