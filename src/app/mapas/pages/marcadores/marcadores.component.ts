import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number]; // ? significa que es opcional
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
        height: 100%;
        width: 100%;
      }

      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }

      li {
        cursor: pointer;
      }
    `,
  ],
})
export class MarcadoresComponent implements AfterViewInit {
  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 16;
  center: [number, number] = [-107.45552627487885, 24.755916313165198];

  //Arreglo de marcadores
  marcadores: MarcadorColor[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel,
    });
    this.leerLocalStorage();

    //Crea un marcador en el mapa con la posición de Sienna
    //lo comenté para que el marcador se cree de manera dinámico
    // const marker = new mapboxgl.Marker()
    //   .setLngLat(this.center)
    //   .addTo(this.mapa);
  }

  agregarMarcador() {
    //Color aleatorio
    const color = '#xxxxxx'.replace(/x/g, (y) =>
      ((Math.random() * 16) | 0).toString(16)
    );

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color, //Se aplica el color aleatorio
    })
      .setLngLat(this.center)
      .addTo(this.mapa);

    this.marcadores.push({
      color,
      marker: nuevoMarcador,
    });

    this.guardarMarcadoresLocalStorage();

    //Guardar la nueva posición del marcador cuando se mueve, se pone un listener
    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    });
  }

  irMarcador(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marker.getLngLat(),
    });
  }

  guardarMarcadoresLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach((m) => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color: color,
        centro: [lng, lat],
      });
    });
    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
  }

  leerLocalStorage() {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(
      localStorage.getItem('marcadores')!
    );

    //Poner los marcadores en el mapa
    lngLatArr.forEach((m) => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true,
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa);

      this.marcadores.push({
        marker: newMarker,
        color: m.color,
      });

      //Guardar la nueva posición del marcador cuando se mueve, se pone un listener
      newMarker.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      });
    });
  }

  borrarMarcador(i: number) {
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.guardarMarcadoresLocalStorage();
  }
}
