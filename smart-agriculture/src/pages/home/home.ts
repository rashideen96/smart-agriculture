import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SocketService } from '../../services/socket.service';
import { FileService } from '../../services/file.service';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public data: Array<any>;
  private subData: any;
  public lastRecord: any;
  isData: boolean = false;


  temp: any = 0;
  // Gauge Chart
  public canvasWidth = 140
  public soil1 = 0
  public soil2 = 0
  public soilTemp1 = 0
  public soilTemp2 = 0
  public light = 0
  public temperature = 0
  public humidity = 0

  public centralLabel = ''
  public name = 'Garbage Level'
  public bottomSoil1 = '0 %'
  public bottomSoil2 = '0 %'
  public bottomSoilTemp1 = '0 C'
  public bottomSoilTemp2 = '0 C'
  public bottomLight = '0 lux'
  public bottomTemp = '0 C'
  public bottomHumd = '0 %'
  public options = {
    hasNeedle: true,
    needleColor: 'gray',
    needleUpdateSpeed: 1000,
    arcColors: ['rgb(61,204,91)', 'rgb(239,214,19)', 'rgb(255,84,84)'],
    arcDelimiters: [40, 70],
    rangeLabel: ['0', '100'],
    needleStartValue: 50,
  }

  // Needle Value

  // Line Chart
  public lineChartOptions: any = {
    responsive: true,
    legend: {
      position: 'bottom'
    },
    hover: {
      mode: 'label'
    },
    scales: {
      xAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Time'
          }
        }
      ],
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }
      ]
    },
    title: {
      display: true,
      text: 'Soil level, light & Temp vs. Time'
    }
  };

  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';

  public lineChartData: Array<any> = [];
  public lineChartLabels: Array<any> = [];

  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(public navCtrl: NavController,
    public socket: SocketService,
    public toastCtrl: ToastService,
    private fileService: FileService,
    private dataService: DataService) {

  }

  ionViewDidLoad() {

    this.getData();
    this.socketInit();
    this.dataSocket();
  }

  ionViewDidUnload() {
    this.subData ? this.subData.unsubscribe() : '';
  }

  getData() {
    this.dataService.get().subscribe((response) => {
      this.data = response.json();
      this.genChart();
      this.lastRecord = this.data[0]; // descending order data

    });
  }

  dataSocket() {
      this.socket.getMessage().subscribe((data) => {
      // this.temp = data;
      this.soil1 = data.data.Soil1;
      this.soil2 = data.data.Soil2;
      this.soilTemp1 = data.data.SoilTemp1;
      this.soilTemp2 = data.data.SoilTemp2;
      this.light = data.data.Light;
      this.temperature = data.data.Temp;
      this.humidity = data.data.Humd;

      this.bottomSoil1 = data.data.Soil1 + ' %';
      this.bottomSoil2 = data.data.Soil2 + ' %';
      this.bottomSoilTemp1 = data.data.SoilTemp1.toFixed(2) + ' C';
      this.bottomSoilTemp2 = data.data.SoilTemp2.toFixed(2) + ' C';
      this.bottomLight = data.data.Light + ' lux';
      this.bottomTemp = data.data.Temp.toFixed(2) + ' C';
      this.bottomHumd = data.data.Humd + ' %';

      // this.lineChartData.push(data);
      // console.log(data);

    });
  }

  socketInit() {
    this.subData = this.socket.getData().subscribe((data) => {
      if (this.data.length <= 0) return;
      this.data.splice(this.data.length - 1, 1); // remove the last record
      this.data.push(data); // add the new one
      this.lastRecord = data;
    }, (err) => console.error(err));
  }

  genChart() {
    let data = this.data;
    let _dtArr: Array<any> = [];
    let _lblArr: Array<any> = [];

    let soil1: Array<any> = [];
    let soil2: Array<any> = [];
    let light: Array<any> = [];
    let temp: Array<any> = [];
    let humd: Array<any> = [];
    let soilTemp1: Array<any> = [];
    let soilTemp2: Array<any> = [];

  
    for (var i = 0; i < data.length; i++) {
      let _d = data[i];
      soil1.push(_d.data.Soil1);
      soil2.push(_d.data.Soil2);
      light.push(_d.data.Light);
      temp.push(_d.data.Temp);
      humd.push(_d.data.Humd);
      soilTemp1.push(_d.data.SoilTemp1);
      soilTemp2.push(_d.data.SoilTemp2);
      _lblArr.push(this.formatDate(_d.createdAt));
    }
    // reverse data to show the latest on the right side
    soil1.reverse(); light.reverse(); soil2.reverse(); temp.reverse(); humd.reverse(); soilTemp1.reverse(); soilTemp2.reverse(); _lblArr.reverse();
    _dtArr = [
      {
        data: soil1,
        label: 'Soil 1',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: soil2,
        label: 'Soil 2',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: light,
        label: 'Light',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: temp,
        label: 'Temperature',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: humd,
        label: 'Humidity',
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: soilTemp1,
        label: 'Soil Temp 1',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        data: soilTemp2,
        label: 'Soil Temp 2',
        fill: false,
        // borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ];

    // this.lineChartData = _dtArr.slice(0, 10);
    // this.lineChartLabels = _lblArr.slice(0, 10);
    this.lineChartData = _dtArr;
    this.lineChartLabels = _lblArr;
    this.isData = true;
  }

  getLatest() {
    this.isData = false;
    this.dataService.get().subscribe((response) => {
      this.data = response.json();
      this.genChart();
      this.toastCtrl.toggleToast('Graph updated!');
      this.isData = true;
    });
    
    
  }

  download() {
    this.dataService.saveFileCSV().subscribe((response) => {
      let msg = response.json();
      this.toastCtrl.toggleToast(msg.msg);
    });
  }

  private formatDate(originalTime) {
    var d = new Date(originalTime);
    var datestring =
      d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes();
    return datestring;
  }

}
