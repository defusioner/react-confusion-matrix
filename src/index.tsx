import React, { useEffect, useRef, useState } from 'react'

export const borderColor = '#dadada'
export const cellHeight = '4em'
export const cellWidth = '10em'

export const styles = {
  body: {
    display: 'flex',
    overflow: 'hidden',
  },
  cell: {
    minWidth: cellWidth,
    maxWidth: cellWidth,
    minHeight: cellHeight,
    maxHeight: cellHeight,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellLastRow: {
    borderBottom: 'none',
  },
  cellLastCol: {
    borderRight: 'none',
  },
  cellGreen: {},
  cellRed: {},
  colHeaders: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: `1 0 ${cellWidth}`,
    overflow: 'hidden',
    background: 'black',
    borderLeft: `1px solid ${borderColor}`,
    borderRight: `1px solid ${borderColor}`,
    color: 'white',
  },
  colHeadersCell: {
    borderBottom: `1px solid ${borderColor}`,
  },
  colHeadersCellLast: {
    borderBottom: 'none',
  },
  colTotals: {
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    flex: `1 0 ${cellWidth}`,
    borderLeft: `1px solid ${borderColor}`,
    borderRight: `1px solid ${borderColor}`,
  },
  colTotalsCell: {
    borderBottom: `1px solid ${borderColor}`,
  },
  column: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  contentCell: {
    borderBottom: `1px solid ${borderColor}`,
    borderRight: `1px solid ${borderColor}`,
  },
  fixedZone: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: `1 0 ${cellWidth}`,
    background: 'black',
    color: 'white',
  },
  footer: {
    display: 'flex',
    flex: `1 0 ${cellHeight}`,
    border: `1px solid ${borderColor}`,
  },
  footerFixedZone: {
    borderRight: `1px solid ${borderColor}`,
  },
  header: {
    display: 'flex',
    flex: `1 0 ${cellHeight}`,
    overflow: 'hidden',
    border: `1px solid ${borderColor}`,
  },
  headerLeftFixedZone: {
    borderRight: `1px solid ${borderColor}`,
  },
  headerRightFixedZone: {
    borderLeft: `1px solid ${borderColor}`,
  },
  root: {
    maxHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    minHeight: cellHeight,
    maxHeight: cellHeight,
  },
  rowHeaders: {
    display: 'flex',
    overflow: 'hidden',
    background: 'black',
    color: 'white',
  },
  rowHeadersCell: {
    borderRight: `1px solid ${borderColor}`,
  },
  rowTotals: {
    display: 'flex',
    background: 'white',
    overflowX: 'auto' as const,
  },
  rowTotalsCell: {
    borderRight: `1px solid ${borderColor}`,
  },
  totalCell: {
    flex: `1 0 ${cellWidth}`,
    background: 'white',
    borderLeft: `1px solid ${borderColor}`,
  },
}

enum SCROLL_DIRECTIONS {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

const SCROLL_THRESHOLD = 2

type Fields = {
  body: any
  colHeaders: any
  isScrolling: boolean
  prevHorizontal: number
  prevVertical: number
  rowHeaders: any
  rowTotals: any
  totalsColumn: any
}

export const dataTestIds = {
  absoluteButton: 'absolute-values-button',
  body: 'body',
  cell: 'cell',
  colHeaders: 'colHeaders',
  percentageButton: 'percentage-values-button',
}

export interface ConfusionMatrixProps {
  columnTitles: Array<string>
  data: Array<Array<any>>
  headerTitles: Array<string>
  lockAxis?: boolean
}

export default function Index({
  columnTitles,
  data,
  headerTitles,
  lockAxis = true,
}: ConfusionMatrixProps) {
  const [fields, setFields] = useState<Fields>({
    body: null,
    colHeaders: null,
    isScrolling: false,
    prevHorizontal: 0,
    prevVertical: 0,
    rowHeaders: null,
    rowTotals: null,
    totalsColumn: null,
  })

  const totalsCol = data.map(row => row.reduce((acc, el) => acc + el, 0))
  const totalsRow = data.map((row, rowIndex) =>
    row.reduce((acc, _, cellIndex) => acc + data[rowIndex][cellIndex], 0)
  )

  const totalsColumnRef = useRef<any>()
  const totalsRowRef = useRef<any>()

  const { rowHeaders, colHeaders, body, totalsColumn, rowTotals } = fields

  useEffect(() => {
    setFields({
      isScrolling: false,
      prevHorizontal: 0,
      prevVertical: 0,
      rowHeaders: document.querySelector('[data-scrollid=rowHeaders]'),
      colHeaders: document.querySelector('[data-scrollid=colHeaders]'),
      body: document.querySelector('[data-scrollid=body]'),
      totalsColumn: document.querySelector('[data-scrollid=totalsColumn]'),
      rowTotals: document.querySelector('[data-scrollid=rowTotals]'),
    })
  }, [])

  useEffect(() => {
    // Prevent page from scrolling when scrolling on the body w/o scrolls
    if (body) {
      body.addEventListener(
        'wheel',
        (e: any) => {
          e.preventDefault()
        },
        {
          passive: false,
        }
      )
    }
  }, [body])

  const AREAS = {
    [SCROLL_DIRECTIONS.VERTICAL]: [totalsColumn, colHeaders, body],
    [SCROLL_DIRECTIONS.HORIZONTAL]: [rowTotals, rowHeaders, body],
  }

  const handleBodyScroll = (e: any) => {
    e.stopPropagation()

    e.persist()

    const scrollTop = body.scrollTop + e.deltaY
    const scrollLeft = body.scrollLeft + e.deltaX

    if (e.deltaY !== 0) {
      if (shouldBodyScrollEventFire(scrollTop, fields.prevVertical)) {
        handleVerticalScroll({ area: body, scrollTop })
      }
    } else if (e.deltaX !== 0) {
      if (shouldBodyScrollEventFire(scrollLeft, fields.prevHorizontal)) {
        handleHorizontalScroll({ area: body, scrollLeft })
      }
    }
  }

  const handleVerticalScroll = ({
    area,
    scrollTop,
  }: { area?: any; scrollTop?: number } = {}) => {
    if (fields.isScrolling) return

    const element = area || totalsColumn

    const maxVertical = element.scrollHeight - element.clientHeight
    const scrolledVertically = scrollTop || element.scrollTop

    tryToScroll({
      direction: SCROLL_DIRECTIONS.VERTICAL,
      scrolled: scrolledVertically,
      maxScroll: maxVertical,
      scrolledArea: element,
      scrollScrolledArea: !!area,
    })

    fields.prevVertical = scrolledVertically
    fields.isScrolling = false
  }

  const handleHorizontalScroll = ({
    area,
    scrollLeft,
  }: { area?: any; scrollLeft?: number } = {}) => {
    if (fields.isScrolling) return

    const element = area || rowTotals

    const maxHorizontal = element.scrollWidth - element.clientWidth
    const scrolledHorizontally = scrollLeft || element.scrollLeft

    tryToScroll({
      direction: SCROLL_DIRECTIONS.HORIZONTAL,
      scrolled: scrolledHorizontally,
      maxScroll: maxHorizontal,
      scrolledArea: element,
      scrollScrolledArea: !!area,
    })

    fields.prevHorizontal = scrolledHorizontally
    fields.isScrolling = false
  }

  const tryToScroll = ({
    direction,
    scrolled,
    maxScroll,
    scrolledArea,
    scrollScrolledArea,
  }: {
    direction: SCROLL_DIRECTIONS
    scrolled: number
    maxScroll: number
    scrolledArea: any
    scrollScrolledArea: boolean
  }) => {
    const { prevVertical, prevHorizontal } = fields

    const prevScrolled =
      direction === SCROLL_DIRECTIONS.VERTICAL ? prevVertical : prevHorizontal

    if (!shouldScrollEventFire(prevScrolled, scrolled, maxScroll)) {
      return
    }

    const percentage = scrolled / maxScroll

    fields.isScrolling = true

    const scrollParams =
      direction === SCROLL_DIRECTIONS.VERTICAL
        ? { scrolledVertically: scrolled }
        : { scrolledHorizontally: scrolled }

    const areasToScroll = [
      ...(lockAxis
        ? [
            ...AREAS[SCROLL_DIRECTIONS.VERTICAL],
            ...AREAS[SCROLL_DIRECTIONS.HORIZONTAL],
          ]
        : AREAS[direction]),
    ].filter(area => (scrollScrolledArea ? true : area !== scrolledArea))

    areasToScroll.map(area =>
      scrollArea({
        lockAxis,
        percentage,
        area,
        ...scrollParams,
      })
    )
  }

  const shouldBodyScrollEventFire = (prevScroll: number, scrolled: number) =>
    Math.abs(Math.abs(prevScroll) - Math.abs(scrolled)) > SCROLL_THRESHOLD

  const shouldScrollEventFire = (
    prevScroll: number,
    scrolled: number,
    maxScrollable: number
  ) => {
    if (
      prevScroll > SCROLL_THRESHOLD &&
      prevScroll < maxScrollable - SCROLL_THRESHOLD &&
      Math.abs(prevScroll - scrolled) < SCROLL_THRESHOLD
    ) {
      return false
    }

    return true
  }

  const scrollArea = ({
    lockAxis,
    percentage,
    scrolledHorizontally,
    scrolledVertically,
    area,
  }: {
    lockAxis: boolean
    percentage: number
    scrolledHorizontally?: number
    scrolledVertically?: number
    area: any
  }) => {
    const maxHorizontal = area.scrollWidth - area.clientWidth
    const maxVertical = area.scrollHeight - area.clientHeight

    const xHoriz = percentage * maxHorizontal
    const yHoriz = lockAxis ? percentage * maxVertical : area.scrollTop

    if (scrolledHorizontally === 0) area.scroll(0, yHoriz)
    if (scrolledHorizontally) {
      if (area !== totalsColumn && area !== colHeaders) {
        area.scroll(xHoriz, yHoriz)
      }
    }

    const xVert = lockAxis ? percentage * maxHorizontal : area.scrollLeft
    const yVert = percentage * maxVertical

    if (scrolledVertically === 0) area.scroll(xVert, 0)
    if (scrolledVertically) {
      if (area !== totalsRow && area !== rowHeaders) {
        area.scroll(xVert, yVert)
      }
    }
  }

  return (
    <div style={styles.root} data-testid="confusion-matrix">
      <div style={styles.header}>
        <div style={{ ...styles.fixedZone, ...styles.headerLeftFixedZone }} />
        <div style={styles.rowHeaders} data-scrollid="rowHeaders">
          {headerTitles.map((x, cellIndex) => (
            <Cell
              key={`header-title-${cellIndex}`}
              value={x}
              style={{
                ...styles.rowHeadersCell,
                ...(cellIndex === headerTitles.length - 1
                  ? styles.cellLastCol
                  : {}),
              }}
            />
          ))}
        </div>
        <div style={{ ...styles.fixedZone, ...styles.headerRightFixedZone }}>
          Total
        </div>
      </div>
      <div style={styles.body}>
        <div
          style={styles.colHeaders}
          data-scrollid="colHeaders"
          data-testid={dataTestIds.colHeaders}
        >
          <div style={styles.column}>
            {columnTitles.map((x, cellIndex) => (
              <Cell
                key={`column-title-${cellIndex}`}
                value={x}
                style={{
                  ...styles.colHeadersCell,
                  ...(cellIndex === columnTitles.length - 1
                    ? styles.colHeadersCellLast
                    : {}),
                }}
              />
            ))}
          </div>
        </div>
        <div
          onWheel={handleBodyScroll}
          style={styles.content}
          data-scrollid="body"
          data-testid={dataTestIds.body}
        >
          {data.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, cellIndex) => (
                <Cell
                  key={`cell-${cellIndex}`}
                  style={{
                    ...styles.contentCell,
                    ...(rowIndex === row.length - 1 ? styles.cellLastRow : {}),
                    ...(cellIndex === row.length - 1 ? styles.cellLastCol : {}),
                    ...(cellIndex === rowIndex
                      ? styles.cellGreen
                      : styles.cellRed),
                  }}
                  value={cell}
                />
              ))}
            </div>
          ))}
        </div>
        <div
          onScroll={() => handleVerticalScroll()}
          ref={totalsColumnRef}
          style={styles.colTotals}
          data-scrollid="totalsColumn"
        >
          <div style={styles.column}>
            {totalsCol.map((cell, cellIndex) => (
              <Cell
                key={`total-column-${cellIndex}`}
                value={cell}
                style={{
                  ...styles.colTotalsCell,
                  ...(cellIndex === totalsCol.length - 1
                    ? styles.cellLastRow
                    : {}),
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div style={styles.footer}>
        <div style={{ ...styles.fixedZone, ...styles.footerFixedZone }}>
          Total
        </div>
        <div
          onScroll={() => handleHorizontalScroll()}
          ref={totalsRowRef}
          style={styles.rowTotals}
          data-scrollid="rowTotals"
        >
          {totalsRow.map((cell, cellIndex) => (
            <Cell
              key={`total-row-${cellIndex}`}
              value={cell}
              style={{
                ...styles.rowTotalsCell,
                ...(cellIndex === headerTitles.length - 1
                  ? styles.cellLastCol
                  : {}),
              }}
            />
          ))}
        </div>
        <div style={styles.totalCell}>
          <Cell value={totalsRow.reduce((acc, el) => acc + el, 0)} />
        </div>
      </div>
    </div>
  )
}

export interface CellProps {
  value?: any
  style?: any
}

export function Cell({ value, style }: CellProps) {
  return (
    <div style={{ ...styles.cell, ...style }} data-testid={dataTestIds.cell}>
      {value}
    </div>
  )
}
