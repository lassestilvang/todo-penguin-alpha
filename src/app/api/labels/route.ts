import { NextRequest, NextResponse } from 'next/server';
import { LabelService } from '@/lib/labels';

export async function GET() {
  try {
    const labels = LabelService.getAllLabels();
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const labelData = await request.json();
    const label = LabelService.createLabel(labelData);
    return NextResponse.json(label);
  } catch (error) {
    console.error('Error creating label:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...labelData } = await request.json();
    const label = LabelService.updateLabel(id, labelData);
    
    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }
    
    return NextResponse.json(label);
  } catch (error) {
    console.error('Error updating label:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    
    const success = LabelService.deleteLabel(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting label:', error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}
