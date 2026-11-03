// pages/reference/HydropnicCompanionPlantingPage
import React from "react";
import {Container,Row,Col,Card,ListGroup,Alert} from "react-bootstrap";

export default function HydroponicCompanionPlantingPage(){
	return (
		<Container className="py-4">
			<Row className="justify-content-center">
				<Col lg={10} xl={9}>
					<Card className="shadow-sm border-0">
						<Card.Body className="p-4 p-md-5">
							<div className="mb-4">
								<h1 className="mb-3">Companion Planting in Hydroponics</h1>
								<p className="mb-0 text-muted">
									What I just learned about pairing plants in hydroponic systems
								</p>
							</div>

							<Alert variant="success" className="mb-4">
								I found out that in hydroponics, it is usually better to grow fast-growing plants with other fast-growing plants, and slower-growing plants with other slower-growing plants. Mixing them can throw off nutrient uptake and pH balance in a shared system.
							</Alert>

							<Row className="g-4">
								<Col md={6}>
									<Card className="h-100 border">
										<Card.Body>
											<h3 className="h5 mb-3">Why This Matters</h3>
											<p className="mb-0">
												In hydroponics, plants do not just share space. They also share the same water, nutrient solution, and pH environment. Because of that, one plant’s growth habits can directly affect the others in the system.
											</p>
										</Card.Body>
									</Card>
								</Col>

								<Col md={6}>
									<Card className="h-100 border">
										<Card.Body>
											<h3 className="h5 mb-3">Main Lesson</h3>
											<p className="mb-0">
												Fast growers tend to take up nutrients and water more aggressively. When mixed with slower growers, they can dominate the system and make it harder to keep conditions stable for everything else.
											</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>

							<div className="mt-5">
								<h2 className="h4 mb-3">What Fast-Growing Plants Can Affect</h2>
								<ListGroup>
									<ListGroup.Item>Nutrient levels can drop faster than expected</ListGroup.Item>
									<ListGroup.Item>pH can shift more quickly</ListGroup.Item>
									<ListGroup.Item>Water can be used up at a different rate</ListGroup.Item>
									<ListGroup.Item>Slower plants may not get what they need consistently</ListGroup.Item>
									<ListGroup.Item>Growth can become uneven across the system</ListGroup.Item>
								</ListGroup>
							</div>

							<Row className="g-4 mt-1">
								<Col md={6}>
									<Card className="h-100 border">
										<Card.Body>
											<h2 className="h4 mb-3">Nutrient Balance</h2>
											<p className="mb-0">
												Fast-growing plants can pull more nitrogen, potassium, and water from the reservoir. That can change the nutrient profile faster than a slower-growing plant can handle, especially in smaller systems.
											</p>
										</Card.Body>
									</Card>
								</Col>

								<Col md={6}>
									<Card className="h-100 border">
										<Card.Body>
											<h2 className="h4 mb-3">pH Stability</h2>
											<p className="mb-0">
												As plants feed at different rates, the shared solution can drift out of range. Once pH moves too much, nutrient availability changes, and that can stress plants even when nutrients are still present.
											</p>
										</Card.Body>
									</Card>
								</Col>
							</Row>

							<div className="mt-5">
								<h2 className="h4 mb-3">Better Grouping Strategy</h2>
								<Row className="g-4">
									<Col md={6}>
										<Card className="h-100 border-success">
											<Card.Body>
												<h3 className="h5 mb-3 text-success">Good Matches</h3>
												<ListGroup variant="flush">
													<ListGroup.Item>Fast growers with fast growers</ListGroup.Item>
													<ListGroup.Item>Slow growers with slow growers</ListGroup.Item>
													<ListGroup.Item>Heavy feeders with similar heavy feeders</ListGroup.Item>
													<ListGroup.Item>Plants with similar pH preferences</ListGroup.Item>
												</ListGroup>
											</Card.Body>
										</Card>
									</Col>

									<Col md={6}>
										<Card className="h-100 border-danger">
											<Card.Body>
												<h3 className="h5 mb-3 text-danger">What to Avoid</h3>
												<ListGroup variant="flush">
													<ListGroup.Item>Mixing aggressive feeders with light feeders</ListGroup.Item>
													<ListGroup.Item>Pairing fast growers with much slower crops</ListGroup.Item>
													<ListGroup.Item>Combining plants with very different pH needs</ListGroup.Item>
													<ListGroup.Item>Ignoring how one crop changes the shared reservoir</ListGroup.Item>
												</ListGroup>
											</Card.Body>
										</Card>
									</Col>
								</Row>
							</div>

							<div className="mt-5">
								<h2 className="h4 mb-3">What This Changed for Me</h2>
								<p>
									I used to think companion planting was mostly about which plants naturally work well together. Now I understand that in hydroponics, it is also about how each plant behaves inside a shared system.
								</p>
								<p className="mb-0">
									It is not just about pairing plants by name. It is about growth speed, nutrient demand, water use, and how all of that affects pH and reservoir stability.
								</p>
							</div>

							<Card className="mt-5 bg-light border-0">
								<Card.Body>
									<h2 className="h4 mb-3">Final Thought</h2>
									<p className="mb-0">
										Hydroponic companion planting works best when plants are grouped by similar behavior, not just by traditional companion planting ideas. Keeping fast-growing plants with other fast-growing plants can make the system easier to manage and help maintain more stable nutrient and pH conditions.
									</p>
								</Card.Body>
							</Card>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}