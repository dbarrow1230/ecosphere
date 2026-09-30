import { useEffect,useMemo,useState } from 'react'
import { Row,Col,Card,Form,Table,Badge,Spinner,Alert } from 'react-bootstrap'
import { CalendarDays,Clock3,CheckCircle2,XCircle,Wallet,Filter } from 'lucide-react'

export default function PayrollTimeOffPage(){
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [requests,setRequests]=useState([])
  const [types,setTypes]=useState([])
  const [balances,setBalances]=useState([])
  const [accrualRules,setAccrualRules]=useState([])
  const [filters,setFilters]=useState({
    search:'',
    status:'',
    type:'',
    startDate:'',
    endDate:''
  })

  useEffect(()=>{
    let active=true
    const load=async()=>{
      try{
        setLoading(true)
        setError('')
        const [reqRes,typeRes,balanceRes,ruleRes]=await Promise.all([
          fetch('/api/time-off/requests'),
          fetch('/api/time-off/types'),
          fetch('/api/time-off/balances'),
          fetch('/api/time-off/accrual-rules')
        ])
        const [reqData,typeData,balanceData,ruleData]=await Promise.all([
          reqRes.json(),
          typeRes.json(),
          balanceRes.json(),
          ruleRes.json()
        ])
        if(!active)return
        setRequests(Array.isArray(reqData)?reqData:reqData?.data||[])
        setTypes(Array.isArray(typeData)?typeData:typeData?.data||[])
        setBalances(Array.isArray(balanceData)?balanceData:balanceData?.data||[])
        setAccrualRules(Array.isArray(ruleData)?ruleData:ruleData?.data||[])
      }catch(err){
        if(!active)return
        setError(err?.message||'Failed to load time off data.')
      }finally{
        if(active)setLoading(false)
      }
    }
    load()
    return()=>{active=false}
  },[])

  const filteredRequests=useMemo(()=>{
    return requests.filter(item=>{
      const employeeName=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim().toLowerCase()
      const typeName=(item?.timeOffType?.name||item?.type?.name||item?.type||'').toLowerCase()
      const status=(item?.status||'').toLowerCase()
      const search=filters.search.trim().toLowerCase()
      const start=item?.startDate?new Date(item.startDate):null
      const end=item?.endDate?new Date(item.endDate):null
      if(search && !employeeName.includes(search) && !typeName.includes(search))return false
      if(filters.status && status!==filters.status.toLowerCase())return false
      if(filters.type && typeName!==filters.type.toLowerCase())return false
      if(filters.startDate && end && end<new Date(filters.startDate))return false
      if(filters.endDate && start && start>new Date(filters.endDate))return false
      return true
    })
  },[requests,filters])

  const totals=useMemo(()=>{
    const approved=requests.filter(item=>(item?.status||'').toLowerCase()==='approved').length
    const pending=requests.filter(item=>(item?.status||'').toLowerCase()==='pending').length
    const denied=requests.filter(item=>(item?.status||'').toLowerCase()==='denied').length
    const totalBalance=balances.reduce((sum,item)=>sum+Number(item?.balanceHours||item?.hoursAvailable||0),0)
    return{approved,pending,denied,totalBalance}
  },[requests,balances])

  const typeOptions=useMemo(()=>{
    const set=new Set()
    types.forEach(item=>{
      if(item?.name)set.add(item.name)
    })
    requests.forEach(item=>{
      const name=item?.timeOffType?.name||item?.type?.name||item?.type
      if(name)set.add(name)
    })
    return Array.from(set)
  },[types,requests])

  const formatDate=value=>{
    if(!value)return '—'
    const d=new Date(value)
    if(Number.isNaN(d.getTime()))return '—'
    return d.toLocaleDateString()
  }

  const getStatusVariant=status=>{
    const value=(status||'').toLowerCase()
    if(value==='approved')return 'success'
    if(value==='pending')return 'warning'
    if(value==='denied')return 'danger'
    return 'secondary'
  }

  return(
    <div className="py-3">
      <Row className="g-3 mb-3 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-2 mb-1">
            <CalendarDays size={24} />
            <h1 className="h3 mb-0">Time Off</h1>
          </div>
          <div className="text-muted">Payroll view for requests, balances, types, and accrual rules.</div>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Pending Requests</div>
                <div className="fs-3 fw-bold">{totals.pending}</div>
              </div>
              <Clock3 size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Approved Requests</div>
                <div className="fs-3 fw-bold">{totals.approved}</div>
              </div>
              <CheckCircle2 size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Denied Requests</div>
                <div className="fs-3 fw-bold">{totals.denied}</div>
              </div>
              <XCircle size={28} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3}>
          <Card className="shadow-sm h-100">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small">Available Balance Hours</div>
                <div className="fs-3 fw-bold">{totals.totalBalance.toFixed(2)}</div>
              </div>
              <Wallet size={28} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white">
          <div className="d-flex align-items-center gap-2 fw-semibold">
            <Filter size={18} />
            <span>Filters</span>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6} xl={3}>
              <Form.Control
                type="text"
                placeholder="Search employee or type"
                value={filters.search}
                onChange={e=>setFilters(prev=>({...prev,search:e.target.value}))}
              />
            </Col>
            <Col md={6} xl={2}>
              <Form.Select
                value={filters.status}
                onChange={e=>setFilters(prev=>({...prev,status:e.target.value}))}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </Form.Select>
            </Col>
            <Col md={6} xl={2}>
              <Form.Select
                value={filters.type}
                onChange={e=>setFilters(prev=>({...prev,type:e.target.value}))}
              >
                <option value="">All Types</option>
                {typeOptions.map(item=><option key={item} value={item}>{item}</option>)}
              </Form.Select>
            </Col>
            <Col md={6} xl={2}>
              <Form.Control
                type="date"
                value={filters.startDate}
                onChange={e=>setFilters(prev=>({...prev,startDate:e.target.value}))}
              />
            </Col>
            <Col md={6} xl={2}>
              <Form.Control
                type="date"
                value={filters.endDate}
                onChange={e=>setFilters(prev=>({...prev,endDate:e.target.value}))}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-3">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Time Off Requests</span>
          <span className="text-muted small">{filteredRequests.length} record(s)</span>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex align-items-center gap-2 py-3">
              <Spinner animation="border" size="sm" />
              <span>Loading...</span>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mb-0">{error}</Alert>
          ) : filteredRequests.length===0 ? (
            <div className="text-muted py-3">No time off requests found.</div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Hours</th>
                    <th>Status</th>
                    <th>Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(item=>{
                    const name=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim()||item?.employeeName||'—'
                    const type=item?.timeOffType?.name||item?.type?.name||item?.type||'—'
                    const hours=Number(item?.hours||item?.requestedHours||0)
                    return(
                      <tr key={item?._id||`${name}-${type}-${item?.startDate||''}`}>
                        <td>{name}</td>
                        <td>{type}</td>
                        <td>{formatDate(item?.startDate)}</td>
                        <td>{formatDate(item?.endDate)}</td>
                        <td>{hours.toFixed(2)}</td>
                        <td><Badge bg={getStatusVariant(item?.status)}>{item?.status||'—'}</Badge></td>
                        <td>{formatDate(item?.createdAt)}</td>
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
            <Card.Header className="bg-white fw-semibold">Time Off Balances</Card.Header>
            <Card.Body>
              {balances.length===0 ? (
                <div className="text-muted">No balances found.</div>
              ) : (
                <div className="d-grid gap-2">
                  {balances.map(item=>{
                    const employee=`${item?.employee?.firstName||''} ${item?.employee?.lastName||''}`.trim()||item?.employeeName||'—'
                    const type=item?.timeOffType?.name||item?.type?.name||item?.type||'Balance'
                    const value=Number(item?.balanceHours||item?.hoursAvailable||0).toFixed(2)
                    return(
                      <div key={item?._id||`${employee}-${type}`} className="border rounded p-3 d-flex justify-content-between align-items-center gap-3">
                        <div>
                          <div className="fw-semibold">{employee}</div>
                          <div className="text-muted small">{type}</div>
                        </div>
                        <div className="fw-bold">{value} hrs</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-semibold">Accrual Rules</Card.Header>
            <Card.Body>
              {accrualRules.length===0 ? (
                <div className="text-muted">No accrual rules found.</div>
              ) : (
                <div className="d-grid gap-2">
                  {accrualRules.map(item=>{
                    const name=item?.name||item?.timeOffType?.name||'Accrual Rule'
                    const rate=item?.accrualRate||item?.rate||0
                    const cap=item?.maxBalance||item?.cap||0
                    return(
                      <div key={item?._id||name} className="border rounded p-3 d-flex justify-content-between align-items-center gap-3">
                        <div>
                          <div className="fw-semibold">{name}</div>
                          <div className="text-muted small">Rate: {rate}</div>
                        </div>
                        <div className="fw-bold">Cap: {cap}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}