import { useEffect,useMemo,useState } from 'react'
import { Row,Col,Card,Form,Table,Badge,Spinner,Alert,Button,Modal } from 'react-bootstrap'
import { ReceiptText,CalendarRange,Calculator,Wallet,CheckCircle2,PlayCircle,RefreshCw,Users,Clock3 } from 'lucide-react'

export default function ProcessPayrollPage(){
  const [loading,setLoading]=useState(true)
  const [processing,setProcessing]=useState(false)
  const [attendanceLoading,setAttendanceLoading]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const [payrolls,setPayrolls]=useState([])
  const [periods,setPeriods]=useState([])
  const [employees,setEmployees]=useState([])
  const [timeEntries,setTimeEntries]=useState([])
  const [selectedPeriodId,setSelectedPeriodId]=useState('')
  const [selectedPayrollId,setSelectedPayrollId]=useState('')
  const [selectedEmployeeIds,setSelectedEmployeeIds]=useState([])
  const [showConfirm,setShowConfirm]=useState(false)
  const [filters,setFilters]=useState({
    status:'',
    search:'',
    employeeSearch:''
  })

  useEffect(()=>{
    let active=true
    const load=async()=>{
      try{
        setLoading(true)
        setError('')
        const [payrollRes,periodRes,employeeRes]=await Promise.all([
          fetch('/api/payroll'),
          fetch('/api/payroll/periods'),
          fetch('/api/employees')
        ])
        const [payrollData,periodData,employeeData]=await Promise.all([
          payrollRes.json(),
          periodRes.json(),
          employeeRes.json()
        ])
        if(!active)return
        const payrollList=Array.isArray(payrollData)?payrollData:payrollData?.data||[]
        const periodList=Array.isArray(periodData)?periodData:periodData?.data||[]
        const employeeList=Array.isArray(employeeData)?employeeData:employeeData?.data||[]
        setPayrolls(payrollList)
        setPeriods(periodList)
        setEmployees(employeeList)
        if(periodList.length){
          const firstPeriodId=periodList[0]?._id||''
          setSelectedPeriodId(firstPeriodId)
        }
      }catch(err){
        if(!active)return
        setError(err?.message||'Failed to load payroll data.')
      }finally{
        if(active)setLoading(false)
      }
    }
    load()
    return()=>{active=false}
  },[])

  useEffect(()=>{
    let active=true
    const loadAttendance=async()=>{
      if(!selectedPeriodId){
        setTimeEntries([])
        setSelectedEmployeeIds([])
        return
      }
      try{
        setAttendanceLoading(true)
        setError('')
        const period=periods.find(item=>(item?._id||'')===selectedPeriodId)
        const params=new URLSearchParams()
        params.append('payrollPeriodId',selectedPeriodId)
        if(period?.startDate)params.append('startDate',period.startDate)
        if(period?.endDate)params.append('endDate',period.endDate)
        const res=await fetch(`/api/time/entries?${params.toString()}`)
        const data=await res.json()
        if(!active)return
        const entryList=Array.isArray(data)?data:data?.data||[]
        setTimeEntries(entryList)
        const ids=Array.from(new Set(
          entryList
            .map(item=>item?.employee?._id||item?.employeeId||'')
            .filter(Boolean)
        ))
        setSelectedEmployeeIds(ids)
      }catch(err){
        if(!active)return
        setTimeEntries([])
        setSelectedEmployeeIds([])
        setError(err?.message||'Failed to load attendance and clock data.')
      }finally{
        if(active)setAttendanceLoading(false)
      }
    }
    loadAttendance()
    return()=>{active=false}
  },[selectedPeriodId,periods])

  const selectedPeriod=useMemo(()=>{
    return periods.find(item=>(item?._id||'')===selectedPeriodId)||null
  },[periods,selectedPeriodId])

  const selectedPayroll=useMemo(()=>{
    return payrolls.find(item=>(item?._id||'')===selectedPayrollId)||null
  },[payrolls,selectedPayrollId])

  const filteredPayrolls=useMemo(()=>{
    return payrolls.filter(item=>{
      const status=(item?.status||'').toLowerCase()
      const search=filters.search.trim().toLowerCase()
      const periodLabel=`${item?.period?.name||''} ${item?.periodLabel||''}`.toLowerCase()
      if(filters.status && status!==filters.status.toLowerCase())return false
      if(search && !periodLabel.includes(search) && !String(item?.payrollNumber||'').toLowerCase().includes(search))return false
      return true
    })
  },[payrolls,filters])

  const employeeAttendanceRows=useMemo(()=>{
    const grouped={}
    timeEntries.forEach(item=>{
      const employeeId=item?.employee?._id||item?.employeeId||''
      if(!employeeId)return
      if(selectedEmployeeIds.length && !selectedEmployeeIds.includes(employeeId))return
      if(filters.employeeSearch){
        const employeeName=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim().toLowerCase()
        if(!employeeName.includes(filters.employeeSearch.trim().toLowerCase()))return
      }
      if(!grouped[employeeId]){
        grouped[employeeId]={
          employeeId,
          employee:item?.employee||employees.find(emp=>(emp?._id||'')===employeeId)||null,
          regularHours:0,
          overtimeHours:0,
          totalHours:0,
          clockInCount:0,
          missingClockOut:0,
          daysWorked:new Set(),
          entries:[]
        }
      }
      const regularHours=Number(item?.regularHours||item?.hours||0)
      const overtimeHours=Number(item?.overtimeHours||0)
      grouped[employeeId].regularHours+=regularHours
      grouped[employeeId].overtimeHours+=overtimeHours
      grouped[employeeId].totalHours+=regularHours+overtimeHours
      if(item?.clockIn||item?.clockInTime)grouped[employeeId].clockInCount+=1
      if((item?.clockIn||item?.clockInTime) && !(item?.clockOut||item?.clockOutTime))grouped[employeeId].missingClockOut+=1
      if(item?.workDate||item?.date)grouped[employeeId].daysWorked.add(String(item?.workDate||item?.date).slice(0,10))
      grouped[employeeId].entries.push(item)
    })
    return Object.values(grouped).map(item=>({
      ...item,
      daysWorked:item.daysWorked.size
    }))
  },[timeEntries,selectedEmployeeIds,employees,filters.employeeSearch])

  const draftPayrolls=useMemo(()=>{
    return payrolls.filter(item=>(item?.status||'').toLowerCase()==='draft').length
  },[payrolls])

  const processedPayrolls=useMemo(()=>{
    return payrolls.filter(item=>{
      const value=(item?.status||'').toLowerCase()
      return value==='processed'||value==='completed'||value==='paid'
    }).length
  },[payrolls])

  const totalGross=useMemo(()=>{
    return payrolls.reduce((sum,item)=>sum+Number(item?.grossPay||item?.totals?.grossPay||0),0)
  },[payrolls])

  const totalNet=useMemo(()=>{
    return payrolls.reduce((sum,item)=>sum+Number(item?.netPay||item?.totals?.netPay||0),0)
  },[payrolls])

  const previewSummary=useMemo(()=>{
    const employeeCount=employeeAttendanceRows.length
    const regularHours=employeeAttendanceRows.reduce((sum,item)=>sum+Number(item?.regularHours||0),0)
    const overtimeHours=employeeAttendanceRows.reduce((sum,item)=>sum+Number(item?.overtimeHours||0),0)
    const payrollForPeriod=payrolls.find(item=>(item?.period?._id||item?.periodId||'')===selectedPeriodId)
    const grossPay=Number(payrollForPeriod?.grossPay||payrollForPeriod?.totals?.grossPay||0)
    const deductions=Number(payrollForPeriod?.deductions||payrollForPeriod?.totals?.deductions||0)
    const netPay=Number(payrollForPeriod?.netPay||payrollForPeriod?.totals?.netPay||0)
    return{
      employeeCount,
      regularHours,
      overtimeHours,
      grossPay,
      deductions,
      netPay
    }
  },[employeeAttendanceRows,payrolls,selectedPeriodId])

  const formatDate=value=>{
    if(!value)return '—'
    const d=new Date(value)
    if(Number.isNaN(d.getTime()))return '—'
    return d.toLocaleDateString()
  }

  const formatDateTime=value=>{
    if(!value)return '—'
    const d=new Date(value)
    if(Number.isNaN(d.getTime()))return '—'
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
  }

  const formatMoney=value=>{
    return Number(value||0).toLocaleString(undefined,{style:'currency',currency:'USD'})
  }

  const getStatusVariant=status=>{
    const value=(status||'').toLowerCase()
    if(value==='draft')return 'secondary'
    if(value==='processing')return 'warning'
    if(value==='processed'||value==='completed')return 'success'
    if(value==='paid')return 'primary'
    if(value==='failed'||value==='cancelled')return 'danger'
    return 'secondary'
  }

  const reloadData=async()=>{
    try{
      setLoading(true)
      setError('')
      const [payrollRes,periodRes,employeeRes]=await Promise.all([
        fetch('/api/payroll'),
        fetch('/api/payroll/periods'),
        fetch('/api/employees')
      ])
      const [payrollData,periodData,employeeData]=await Promise.all([
        payrollRes.json(),
        periodRes.json(),
        employeeRes.json()
      ])
      setPayrolls(Array.isArray(payrollData)?payrollData:payrollData?.data||[])
      setPeriods(Array.isArray(periodData)?periodData:periodData?.data||[])
      setEmployees(Array.isArray(employeeData)?employeeData:employeeData?.data||[])
    }catch(err){
      setError(err?.message||'Failed to refresh payroll data.')
    }finally{
      setLoading(false)
    }
  }

  const handleEmployeeToggle=(employeeId)=>{
    setSelectedEmployeeIds(prev=>{
      if(prev.includes(employeeId))return prev.filter(id=>id!==employeeId)
      return [...prev,employeeId]
    })
  }

  const handleToggleAllEmployees=()=>{
    const allIds=employeeAttendanceRows.map(item=>item.employeeId)
    if(selectedEmployeeIds.length===allIds.length){
      setSelectedEmployeeIds([])
      return
    }
    setSelectedEmployeeIds(allIds)
  }

  const handleProcessPayroll=async()=>{
    if(!selectedPeriodId || !selectedEmployeeIds.length)return
    try{
      setProcessing(true)
      setError('')
      setSuccess('')
      const res=await fetch('/api/payroll/process',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          payrollPeriodId:selectedPeriodId,
          employeeIds:selectedEmployeeIds
        })
      })
      const data=await res.json()
      if(!res.ok)throw new Error(data?.message||'Failed to process payroll.')
      setSuccess(data?.message||'Payroll processed successfully.')
      setShowConfirm(false)
      await reloadData()
    }catch(err){
      setError(err?.message||'Failed to process payroll.')
    }finally{
      setProcessing(false)
    }
  }

  return(
    <div className="py-3">
      <Row className="g-3 mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2 mb-1">
            <ReceiptText size={24} />
            <h1 className="h3 mb-0">Process Payroll</h1>
          </div>
          <div className="text-muted">Review payroll period attendance, clock records, and choose employees to process.</div>
        </Col>
        <Col xs="auto">
          <Button variant="outline-secondary" className="d-flex align-items-center gap-2" onClick={reloadData} disabled={loading||processing||attendanceLoading}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </Col>
      </Row>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <Row className="g-3 mb-3">
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Payroll Periods</div>
                <div className="fs-3 fw-bold">{periods.length}</div>
              </div>
              <CalendarRange size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Draft Payrolls</div>
                <div className="fs-3 fw-bold">{draftPayrolls}</div>
              </div>
              <Calculator size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Employees Selected</div>
                <div className="fs-3 fw-bold">{selectedEmployeeIds.length}</div>
              </div>
              <Users size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Total Net Pay</div>
                <div className="fs-4 fw-bold">{formatMoney(totalNet)}</div>
              </div>
              <Wallet size={28} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col xl={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold">Payroll Run</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Payroll Period</Form.Label>
                <Form.Select value={selectedPeriodId} onChange={e=>setSelectedPeriodId(e.target.value)}>
                  <option value="">Select period</option>
                  {periods.map(item=>{
                    const label=item?.name||`${formatDate(item?.startDate)} - ${formatDate(item?.endDate)}`
                    return <option key={item?._id||label} value={item?._id||''}>{label}</option>
                  })}
                </Form.Select>
              </Form.Group>

              <div className="border rounded p-3 mb-3">
                <div className="fw-semibold mb-2">Selected Period</div>
                <div className="small text-muted">Start</div>
                <div className="mb-2">{formatDate(selectedPeriod?.startDate)}</div>
                <div className="small text-muted">End</div>
                <div className="mb-2">{formatDate(selectedPeriod?.endDate)}</div>
                <div className="small text-muted">Pay Date</div>
                <div>{formatDate(selectedPeriod?.payDate)}</div>
              </div>

              <div className="d-grid">
                <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2" disabled={!selectedPeriodId||processing||!selectedEmployeeIds.length} onClick={()=>setShowConfirm(true)}>
                  {processing ? <Spinner animation="border" size="sm" /> : <PlayCircle size={16} />}
                  Process Selected Employees
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold">Payroll Preview</Card.Header>
            <Card.Body>
              {loading||attendanceLoading ? (
                <div className="d-flex align-items-center gap-2 py-3">
                  <Spinner animation="border" size="sm" />
                  <span>Loading...</span>
                </div>
              ) : (
                <Row className="g-3">
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Employees</div>
                      <div className="fs-4 fw-bold">{previewSummary.employeeCount}</div>
                    </div>
                  </Col>
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Regular Hours</div>
                      <div className="fs-4 fw-bold">{previewSummary.regularHours.toFixed(2)}</div>
                    </div>
                  </Col>
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Overtime Hours</div>
                      <div className="fs-4 fw-bold">{previewSummary.overtimeHours.toFixed(2)}</div>
                    </div>
                  </Col>
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Gross Pay</div>
                      <div className="fs-4 fw-bold">{formatMoney(previewSummary.grossPay)}</div>
                    </div>
                  </Col>
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Deductions</div>
                      <div className="fs-4 fw-bold">{formatMoney(previewSummary.deductions)}</div>
                    </div>
                  </Col>
                  <Col md={6} xl={4}>
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Net Pay</div>
                      <div className="fs-4 fw-bold">{formatMoney(previewSummary.netPay)}</div>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white">
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <div className="fw-semibold">Employee Attendance For Period</div>
            </Col>
            <Col md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Search employee"
                value={filters.employeeSearch}
                onChange={e=>setFilters(prev=>({...prev,employeeSearch:e.target.value}))}
              />
            </Col>
            <Col md={6} lg={4} className="d-flex justify-content-md-end">
              <Button variant="outline-secondary" onClick={handleToggleAllEmployees} disabled={!employeeAttendanceRows.length}>
                {selectedEmployeeIds.length===employeeAttendanceRows.length && employeeAttendanceRows.length ? 'Clear All' : 'Select All'}
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {attendanceLoading ? (
            <div className="d-flex align-items-center gap-2 py-3">
              <Spinner animation="border" size="sm" />
              <span>Loading attendance and clock data...</span>
            </div>
          ) : employeeAttendanceRows.length===0 ? (
            <div className="text-muted py-3">No attendance or clock records found for this payroll period.</div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{width:'56px'}}>Use</th>
                    <th>Employee</th>
                    <th>Days</th>
                    <th>Regular</th>
                    <th>OT</th>
                    <th>Total</th>
                    <th>Clock Ins</th>
                    <th>Missing Clock Out</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAttendanceRows.map(item=>{
                    const name=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim()||item?.employee?.fullName||item?.employeeId
                    return(
                      <tr key={item.employeeId}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedEmployeeIds.includes(item.employeeId)}
                            onChange={()=>handleEmployeeToggle(item.employeeId)}
                          />
                        </td>
                        <td>{name}</td>
                        <td>{item.daysWorked}</td>
                        <td>{Number(item.regularHours||0).toFixed(2)}</td>
                        <td>{Number(item.overtimeHours||0).toFixed(2)}</td>
                        <td>{Number(item.totalHours||0).toFixed(2)}</td>
                        <td>{item.clockInCount}</td>
                        <td>
                          <Badge bg={item.missingClockOut>0?'danger':'success'}>
                            {item.missingClockOut}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white fw-semibold d-flex align-items-center gap-2">
          <Clock3 size={18} />
          Clock And Attendance Entries
        </Card.Header>
        <Card.Body>
          {attendanceLoading ? (
            <div className="d-flex align-items-center gap-2 py-3">
              <Spinner animation="border" size="sm" />
              <span>Loading clock entries...</span>
            </div>
          ) : timeEntries.filter(item=>{
              const employeeId=item?.employee?._id||item?.employeeId||''
              return selectedEmployeeIds.includes(employeeId)
            }).length===0 ? (
            <div className="text-muted py-3">No clock entries for selected employees.</div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Work Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Regular Hours</th>
                    <th>OT Hours</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries
                    .filter(item=>{
                      const employeeId=item?.employee?._id||item?.employeeId||''
                      return selectedEmployeeIds.includes(employeeId)
                    })
                    .map(item=>{
                      const employeeId=item?.employee?._id||item?.employeeId||''
                      const name=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim()||employees.find(emp=>(emp?._id||'')===employeeId)?.fullName||employeeId
                      const regularHours=Number(item?.regularHours||item?.hours||0)
                      const overtimeHours=Number(item?.overtimeHours||0)
                      const totalHours=regularHours+overtimeHours
                      const hasClockOut=Boolean(item?.clockOut||item?.clockOutTime)
                      return(
                        <tr key={item?._id||`${employeeId}-${item?.workDate||item?.date||item?.clockIn||''}`}>
                          <td>{name}</td>
                          <td>{formatDate(item?.workDate||item?.date)}</td>
                          <td>{formatDateTime(item?.clockIn||item?.clockInTime)}</td>
                          <td>{formatDateTime(item?.clockOut||item?.clockOutTime)}</td>
                          <td>{regularHours.toFixed(2)}</td>
                          <td>{overtimeHours.toFixed(2)}</td>
                          <td>{totalHours.toFixed(2)}</td>
                          <td>
                            <Badge bg={hasClockOut?'success':'danger'}>
                              {hasClockOut?'Complete':'Open Shift'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white">
          <Row className="g-3 align-items-center">
            <Col lg={4}>
              <div className="fw-semibold">Payroll History</div>
            </Col>
            <Col md={6} lg={3}>
              <Form.Control
                type="text"
                placeholder="Search payroll"
                value={filters.search}
                onChange={e=>setFilters(prev=>({...prev,search:e.target.value}))}
              />
            </Col>
            <Col md={6} lg={3}>
              <Form.Select
                value={filters.status}
                onChange={e=>setFilters(prev=>({...prev,status:e.target.value}))}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="processing">Processing</option>
                <option value="processed">Processed</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3">
              <Spinner animation="border" size="sm" />
              <span>Loading...</span>
            </div>
          ) : filteredPayrolls.length===0 ? (
            <div className="text-muted py-3">No payroll records found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Payroll</th>
                    <th>Period</th>
                    <th>Employees</th>
                    <th>Gross Pay</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                    <th>Processed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map(item=>{
                    const periodLabel=item?.period?.name||item?.periodLabel||`${formatDate(item?.period?.startDate||item?.startDate)} - ${formatDate(item?.period?.endDate||item?.endDate)}`
                    return(
                      <tr key={item?._id||item?.payrollNumber||periodLabel}>
                        <td>
                          <Button variant="link" className="p-0 text-decoration-none fw-semibold" onClick={()=>setSelectedPayrollId(item?._id||'')}>
                            {item?.payrollNumber||item?._id||'Payroll'}
                          </Button>
                        </td>
                        <td>{periodLabel}</td>
                        <td>{Number(item?.employeeCount||0)}</td>
                        <td>{formatMoney(item?.grossPay||item?.totals?.grossPay||0)}</td>
                        <td>{formatMoney(item?.netPay||item?.totals?.netPay||0)}</td>
                        <td><Badge bg={getStatusVariant(item?.status)}>{item?.status||'—'}</Badge></td>
                        <td>{formatDate(item?.processedAt||item?.updatedAt||item?.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col xl={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold">Selected Payroll Details</Card.Header>
            <Card.Body>
              {!selectedPayroll ? (
                <div className="text-muted">Select a payroll record from the table.</div>
              ) : (
                <Row className="g-3">
                  <Col md={6}>
                    <div className="small text-muted">Payroll Number</div>
                    <div className="fw-semibold">{selectedPayroll?.payrollNumber||'—'}</div>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">Status</div>
                    <div><Badge bg={getStatusVariant(selectedPayroll?.status)}>{selectedPayroll?.status||'—'}</Badge></div>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">Gross Pay</div>
                    <div className="fw-semibold">{formatMoney(selectedPayroll?.grossPay||selectedPayroll?.totals?.grossPay||0)}</div>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">Net Pay</div>
                    <div className="fw-semibold">{formatMoney(selectedPayroll?.netPay||selectedPayroll?.totals?.netPay||0)}</div>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">Taxes</div>
                    <div className="fw-semibold">{formatMoney(selectedPayroll?.taxes||selectedPayroll?.totals?.taxes||0)}</div>
                  </Col>
                  <Col md={6}>
                    <div className="small text-muted">Deductions</div>
                    <div className="fw-semibold">{formatMoney(selectedPayroll?.deductions||selectedPayroll?.totals?.deductions||0)}</div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold">Payroll Totals</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Gross Pay</span>
                  <span className="fw-bold">{formatMoney(totalGross)}</span>
                </div>
                <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Net Pay</span>
                  <span className="fw-bold">{formatMoney(totalNet)}</span>
                </div>
                <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total Records</span>
                  <span className="fw-bold">{payrolls.length}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showConfirm} onHide={()=>!processing&&setShowConfirm(false)} centered>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>Process Payroll</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2">Are you sure you want to process payroll for the selected employees in this period?</div>
          <div className="small text-muted mb-1">
            {selectedPeriod?.name||`${formatDate(selectedPeriod?.startDate)} - ${formatDate(selectedPeriod?.endDate)}`}
          </div>
          <div className="small text-muted">
            Employees selected: {selectedEmployeeIds.length}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={()=>setShowConfirm(false)} disabled={processing}>Cancel</Button>
          <Button variant="primary" onClick={handleProcessPayroll} disabled={processing||!selectedPeriodId||!selectedEmployeeIds.length} className="d-flex align-items-center gap-2">
            {processing ? <Spinner animation="border" size="sm" /> : <PlayCircle size={16} />}
            Confirm Process
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}