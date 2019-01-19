/**
 * @fileoverview Test for RaphaelMapChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */
import RaphaelMapChart, {createGElement} from '../../src/js/plugins/raphaelMapChart';
import raphaelRenderUtil from '../../src/js/plugins/raphaelRenderUtil';
import raphael from 'raphael';

describe('RaphaelMapChart', () => {
    let mapChart;
    const paperContainer = document.createElement('div'), numberOfSectors = 5;

    beforeEach(() => {
        mapChart = new RaphaelMapChart();
        mapChart.paper = raphael(paperContainer, 100, 100);
        mapChart.sectorSet = mapChart.paper.set();
        Array.from(new Array(numberOfSectors), () => mapChart.sectorSet.push(raphaelRenderUtil.renderArea(mapChart.paper, 'M343', {
            fill: '#fff',
            opacity: 1,
            stroke: '#fff',
            'stroke-width': 0.2,
            'stroke-opacity': 1
        })));
    });

    describe('resize()', () => {
        it('paper.setSize() must be executed with passed arguments', () => {
            spyOn(mapChart.paper, 'setSize');
            mapChart.resize({dimension: {width: 400, height: 400}});
            expect(mapChart.paper.setSize).toHaveBeenCalledWith(400, 400);
        });
    });

    describe('createGElement()', () => {
        const id = 'g-id';
        let g;

        beforeEach(() => {
            g = createGElement(mapChart.paper, mapChart.sectorSet, id);
        });

        it('should return <g> element with passed id attribute', () => {
            expect(typeof (g)).toBe('object');
            expect(g.getAttribute('id')).toBe(id);
        });

        it('should append <path> elements inside <g> element', () => {
            expect(g.childElementCount).toBe(numberOfSectors);
        });

        it('should append <g> element to paper.canvas', () => {
            const appendedElement = mapChart.paper.canvas.getElementById(id);
            expect(typeof (appendedElement)).toBe('object');
            expect(g).toBe(appendedElement);
        });
    });
});
